export class HttpError extends Error {
  constructor(status, message, errors = null) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function notFound(req, res) {
  res.status(404).json({
    status: "error",
    message: "Route not found.",
  });
}

export function errorHandler(err, req, res, _next) {
  if (err instanceof HttpError) {
    const body = { status: "error", message: err.message };
    if (err.errors) {
      body.errors = err.errors;
    }
    res.status(err.status).json(body);
    return;
  }

  if (err.type === "entity.parse.failed") {
    res.status(400).json({
      status: "error",
      message: "Request body must be valid JSON",
    });
    return;
  }

  if (err.name === "MulterError") {
    res.status(400).json({
      status: "error",
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "File size must be under 5 MB."
          : "Invalid image upload.",
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}
