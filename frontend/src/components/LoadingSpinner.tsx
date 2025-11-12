export default function LoadingSpinner({ size = 48 }: { size?: number }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center p-4">
      <svg
        className="animate-spin"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.1)" strokeWidth="4"></circle>
        <path
          d="M22 12a10 10 0 00-10-10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        ></path>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
