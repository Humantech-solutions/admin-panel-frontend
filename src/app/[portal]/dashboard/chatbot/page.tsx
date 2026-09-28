export default function ChatbotPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#11253e]">Chatbot</h1>
        <p className="text-gray-500 text-sm mt-1">Configure chatbot responses and monitor conversations from site visitors.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-[#11253e] text-sm">Chatbot Conversations</h2>
          <span className="bg-[#f99d1c]/10 text-[#f99d1c] text-xs font-semibold px-2.5 py-1 rounded-full">0 conversations</span>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center mb-4">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#11253e" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-[#11253e] font-semibold">No chatbot conversations yet</p>
          <p className="text-gray-400 text-sm mt-1">Visitor chat sessions will be logged and displayed here.</p>
        </div>
      </div>
    </div>
  );
}
