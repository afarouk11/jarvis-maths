interface Props {
  size?: number
  className?: string
}

export function StudiQLogo({ size = 32, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="7" fill="#0F1724" />
      <rect x="5" y="6" width="2" height="20" rx="1" fill="white" fillOpacity="0.2" />
      <rect x="9" y="6" width="18" height="5" rx="2" fill="#3B6FE8" />
      <rect x="7" y="14" width="20" height="5" rx="2" fill="white" />
      <rect x="7" y="22" width="12" height="5" rx="2" fill="#3B6FE8" />
    </svg>
  )
}
