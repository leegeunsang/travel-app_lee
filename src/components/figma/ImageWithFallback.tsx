import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Silently handle image errors - they're expected with external URLs
    setDidError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const { src, alt, style, className, ...rest } = props

  if (didError) {
    return (
      <div
        className={`bg-gray-200 text-center flex items-center justify-center ${className ?? ''}`}
        style={style}
      >
        <img src={ERROR_IMG_SRC} alt="Error loading image" className="w-20 h-20 opacity-30" {...rest} data-original-url={src} />
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div
          className={`bg-gray-200 animate-pulse ${className ?? ''}`}
          style={style}
        />
      )}
      <img 
        src={src} 
        alt={alt} 
        className={className} 
        style={{
          ...style,
          display: isLoading ? 'none' : 'block'
        }} 
        onError={handleError}
        onLoad={handleLoad}
        {...rest}
      />
    </>
  )
}
