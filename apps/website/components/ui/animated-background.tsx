/**
 * Animated background with gradient and orbs
 */
export function AnimatedBackground() {
  return (
    <>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Floating orbs - hidden on mobile to prevent overflow */}
      <div className="hidden sm:block absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-[128px] opacity-20 animate-pulse" />
      <div className="hidden sm:block absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-[128px] opacity-20 animate-pulse delay-1000" />

      {/* Mobile-optimized orbs */}
      <div className="sm:hidden absolute top-10 left-10 w-48 h-48 bg-purple-500 rounded-full blur-[64px] opacity-20 animate-pulse" />
      <div className="sm:hidden absolute bottom-10 right-10 w-48 h-48 bg-blue-500 rounded-full blur-[64px] opacity-20 animate-pulse delay-1000" />
    </>
  );
}
