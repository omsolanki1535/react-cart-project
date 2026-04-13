function LoadingOverlay() {
  return (
    <div className="loading-overlay" aria-live="polite" aria-label="Loading storefront">
      <div className="loader-scene">
        <div className="loader-ring loader-ring--one" />
        <div className="loader-ring loader-ring--two" />
        <div className="loader-core">OZONE</div>
      </div>
    </div>
  )
}

export default LoadingOverlay
