const { OrchestratorRequestSchema } = require('../dtos/orchestrator.dto');
const { OrchestratorService } = require('../services/OrchestratorService');
const { ValidationError } = require('../shared/errors/AppError');
const { success, fromAppError } = require('../shared/utils/responseBuilder');

const orchestratorService = new OrchestratorService();

function tryParseBody(event) {
  if (event?.body == null) {
    return {};
  }

  if (typeof event.body === 'object') {
    return event.body;
  }

  try {
    return JSON.parse(event.body);
  } catch {
    throw new ValidationError('Request body must be valid JSON', 'validate_input');
  }
}

function extractCorrelationId(event, body) {
  if (body && typeof body.correlation_id === 'string' && body.correlation_id.trim()) {
    return body.correlation_id;
  }

  const headers = event?.headers || {};
  const headerCorrelationId = headers['x-correlation-id'] || headers['X-Correlation-Id'] || headers['correlation-id'];

  return headerCorrelationId || event?.requestContext?.requestId || null;
}

module.exports.createAndConfirmOrder = async (event) => {
  let parsedBody = {};
  let correlationId = null;

  try {
    parsedBody = tryParseBody(event);
    correlationId = extractCorrelationId(event, parsedBody);

    const validationResult = OrchestratorRequestSchema.safeParse(parsedBody);
    if (!validationResult.success) {
      const message = validationResult.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');

      throw new ValidationError(message, 'validate_input');
    }

    const result = await orchestratorService.execute(validationResult.data);
    return success(201, result, correlationId);
  } catch (err) {
    correlationId = correlationId || extractCorrelationId(event, parsedBody);
    return fromAppError(err, correlationId);
  }
};
