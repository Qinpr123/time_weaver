import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    (<Sonner
      theme={theme}
      className="toaster group"
      position="top-center"
      // 桌面默认 32px、窄屏默认 16px，收窄过 600px 会整块上移；两端统一
      offset={32}
      mobileOffset={32}
      style={{
        fontFamily: '"Noto Serif SC", serif',
        // 默认 356px，加宽约 4 个汉字，避免确认文案折行
        '--width': '420px',
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#2C2C2C] group-[.toaster]:border-[#E7E5E4] group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-[#6B6B6B]",
          success: "group-[.toaster]:bg-green-50 group-[.toaster]:border-green-200 group-[.toaster]:text-green-700",
          error: "group-[.toaster]:bg-red-50 group-[.toaster]:border-red-200 group-[.toaster]:text-red-700",
          loading: "group-[.toaster]:bg-[#F8F6F0] group-[.toaster]:border-[#D4A574] group-[.toaster]:text-[#2C2C2C]",
          actionButton:
            "group-[.toast]:bg-[#D4A574] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-[#F8F6F0] group-[.toast]:text-[#6B6B6B]",
        },
      }}
      {...props} />)
  );
}

export { Toaster }
