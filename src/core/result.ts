export type Result<Success, Failure> =
  | {
      ok: true;
      data: Success;
    }
  | {
      ok: false;
      error: Failure;
    };
