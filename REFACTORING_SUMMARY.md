# Event Bus Refactoring Summary

## Overview
Simplified the codebase by removing unnecessary Event Bus usage where fanout (1→N) was not needed, keeping direct Command/Query Bus execution for simple 1→1 flows.

## Changes Made

### ✅ Removed Unnecessary Event Bus Usage

#### 1. **Answer Creation Flow** (Simplified)
**Before:**
```
RabbitMQ → Controller → Event Bus → Saga → Command Bus → Handler
```

**After:**
```
RabbitMQ → Controller → Command Bus → Handler
```

**Files Modified:**
- `apps/answers/src/answers.controller.ts` - Now directly executes `CreateAnswerCommand`
- `apps/answers/src/sagas/answer.saga.ts` - Removed `answerCreationRequested` saga

**Files Deleted:**
- `apps/answers/src/events/impl/answer-creation-requested.event.ts`

---

#### 2. **Answer Validation Flow** (Simplified)
**Before:**
```
RabbitMQ → Controller → Event Bus → Handler → Query + RabbitMQ
```

**After:**
```
RabbitMQ → Controller → Query + RabbitMQ
```

**Files Modified:**
- `apps/questions/src/questions.controller.ts` - Now directly executes validation logic
- `apps/questions/src/questions.module.ts` - Removed `AnswerSubmittedHandler` from providers

**Files Deleted:**
- `apps/questions/src/events/impl/answer-submitted.event.ts`
- `apps/questions/src/events/handlers/answer-submitted.handler.ts`
- Updated `apps/questions/src/events/handlers/index.ts`

---

#### 3. **Answer Rejection Flow** (Simplified)
**Before:**
```
RabbitMQ → Controller → Event Bus → Saga → Command Bus → Handler
```

**After:**
```
RabbitMQ → Controller → Command Bus → Handler
```

**Files Modified:**
- `apps/answers/src/answers.controller.ts` - Now directly executes `DeleteAnswerCommand`
- `apps/answers/src/sagas/answer.saga.ts` - Removed `answerRejected` saga

**Files Deleted:**
- `apps/answers/src/events/impl/answer-rejected.event.ts`

---

### ✅ Kept Necessary Event Bus Usage

#### **Question Deletion Cascade** (Kept - Fanout Needed)
**Flow:**
```
RabbitMQ → Controller → Event Bus → [Handler1: Write DB, Handler2: Read DB]
```

**Why Kept:**
- **Fanout required**: 2 handlers need to react
  1. `QuestionDeletedExternalHandler` - Deletes answers from write DB
  2. `AnswersQuestionDeletedProjection` - Deletes answers from read DB
- **CQRS pattern**: Maintains separation between write and read models

**Files Unchanged:**
- `apps/answers/src/answers.controller.ts` - `handleQuestionDeleted()` still uses Event Bus
- `apps/answers/src/events/handlers/question-deleted-external.handler.ts`
- `apps/answers/src/events/handlers/question-deleted.projection.ts`

---

#### **Answer Created Event** (Kept - Saga Orchestration)
**Flow:**
```
Command Handler → Event Bus → Saga → RabbitMQ (async validation)
```

**Why Kept:**
- **Saga orchestration**: Triggers async validation workflow
- **Domain event**: Represents a fact that happened
- **Multiple potential handlers**: Could have notifications, analytics, etc.

**Files Unchanged:**
- `apps/answers/src/commands/handlers/create-answer.handler.ts` - Still publishes `AnswerCreatedEvent`
- `apps/answers/src/sagas/answer.saga.ts` - `answerCreated` saga still exists

---

## Architecture Improvements

### Before Refactoring
- **Explicit Sagas**: 4 (3 in answers, 1 in questions)
- **Unnecessary indirection**: 3 flows with single listeners using Event Bus
- **Complexity**: Event Bus used even for 1→1 flows

### After Refactoring
- **Explicit Sagas**: 1 (only `answerCreated` in answers service)
- **Direct execution**: Controllers directly use Command/Query Bus when no fanout needed
- **Clarity**: Event Bus only used when multiple handlers need to react

### Key Principle Applied
> **Use Event Bus for fanout (1→N), use Command/Query Bus for direct execution (1→1)**

---

## Benefits

1. **Reduced Complexity**: Removed 3 unnecessary event types and 2 sagas
2. **Better Performance**: Fewer hops in the execution chain
3. **Easier Debugging**: Direct execution paths are easier to trace
4. **Clearer Intent**: Event Bus usage now clearly indicates fanout scenarios
5. **Maintainability**: Less code to maintain, clearer separation of concerns

---

## Remaining Event Bus Usage (All Justified)

| Event | Handlers | Reason |
|-------|----------|--------|
| `QuestionDeletedExternalEvent` | 2 | CQRS: Write DB + Read DB |
| `AnswerCreatedEvent` | 2+ | Saga orchestration + projections |
| `QuestionDeletedEvent` | 2 | RabbitMQ publish + Read DB projection |
| `QuestionCreatedEvent` | 2 | Logging + Read DB projection |
| `AnswerDeletedEvent` | 1+ | Read DB projection (+ potential future handlers) |

All remaining Event Bus usage follows the fanout pattern or represents domain events that multiple systems may care about.

---

## Testing Recommendations

1. **Answer Creation**: Test that answers are created directly without intermediate events
2. **Answer Validation**: Test that validation happens synchronously in controller
3. **Answer Rejection**: Test that rejected answers are deleted directly
4. **Question Deletion**: Test that both write and read DBs are updated (fanout still works)
5. **Answer Created Saga**: Test that async validation is still triggered via RabbitMQ

---

## Migration Notes

- No database schema changes required
- No API contract changes
- Backward compatible with existing RabbitMQ messages
- All functionality preserved, just simplified execution paths
