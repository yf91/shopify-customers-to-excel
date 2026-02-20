export default async function HomePage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="bg-muted rounded-full px-4 py-2 flex items-center justify-center gap-3">
        <span className="relative flex size-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex size-4 rounded-full bg-green-600"></span>
        </span>
        <span className="font-semibold uppercase">App connected</span>
      </div>
    </div>
  );
}
