type ErrorMessageType = {
  message: string;
};

export function ErrorMessage({ message }: ErrorMessageType) {
  return (
    <div className="error-message">
      <p>{message}</p>
    </div>
  );
}
