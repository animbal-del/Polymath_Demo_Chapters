export default function SpeechBubble({ children }) {
  return (
    <div className="relative max-w-md rounded-2xl bg-white px-6 py-4 text-sm font-semibold leading-6 shadow-soft">
      <div className="absolute -left-3 top-8 h-0 w-0 border-y-8 border-r-[14px] border-y-transparent border-r-white" />
      {children}
    </div>
  );
}
