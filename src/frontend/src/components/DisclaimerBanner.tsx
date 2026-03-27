export function DisclaimerBanner() {
  return (
    <div
      data-ocid="disclaimer.panel"
      className="w-full bg-amber-900/20 border-b border-amber-500/30 px-4 py-2.5 text-center"
    >
      <p className="text-xs text-amber-300 font-medium tracking-wide">
        <span className="mr-2">⚠️</span>
        <strong>EDUCATIONAL PURPOSES ONLY</strong> — This app does not provide
        financial advice. All signals are simulated and for demonstration only.
        Always do your own research before making investment decisions.
      </p>
    </div>
  );
}
