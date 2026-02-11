type LoadingType = {
  message?: string;
};

export function Loading({ message = 'Loading...' }: LoadingType) {
  return (
    <div className="loading">
      <p>{message}</p>
    </div>
  );
}
