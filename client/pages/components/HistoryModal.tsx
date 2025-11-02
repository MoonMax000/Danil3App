import React, { memo, useCallback } from "react";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: string[];
}

const HistoryModal = memo(function HistoryModal({
  isOpen,
  onClose,
  chatHistory,
}: HistoryModalProps) {
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />
      <div className="fixed left-0 top-0 z-50 h-full w-[222px] overflow-hidden rounded-r-2xl border-r border-[#181B22] bg-[rgba(12,16,20,0.95)] backdrop-blur-xl">
        <div className="flex h-full flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[19px] font-bold text-white">Chats</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 transition-colors hover:bg-white/10"
              aria-label="Close history"
            >
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <button className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-white/5">
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.6874 3.83757L14.5124 3.01258C15.1959 2.32914 16.304 2.32914 16.9874 3.01258C17.6708 3.69603 17.6708 4.80411 16.9874 5.48756L16.1624 6.31255M13.6874 3.83757L8.13798 9.387C7.71506 9.81 7.41503 10.3398 7.26998 10.9201L6.66667 13.3333L9.07992 12.73C9.66017 12.585 10.19 12.2849 10.613 11.862L16.1624 6.31255M13.6874 3.83757L16.1624 6.31255"
                stroke="#B0B0B0"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M15.8333 11.2501C15.8333 13.9897 15.8332 15.3594 15.0767 16.2814C14.9382 16.4502 14.7834 16.6049 14.6146 16.7434C13.6927 17.5001 12.3228 17.5001 9.58325 17.5001H9.16667C6.02397 17.5001 4.45263 17.5001 3.47632 16.5237C2.50002 15.5475 2.5 13.9761 2.5 10.8334V10.4167C2.5 7.67718 2.5 6.30741 3.25662 5.38545C3.39514 5.21666 3.54992 5.06189 3.7187 4.92336C4.64066 4.16675 6.01043 4.16675 8.75 4.16675"
                stroke="#B0B0B0"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[15px] font-bold text-[#B0B0B0]">
              New Chat
            </span>
          </button>

          <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
            {chatHistory.map((chat, idx) => (
              <button
                key={idx}
                className="truncate rounded-lg px-3 py-2 text-left text-[15px] font-normal text-white transition-colors hover:bg-white/5"
              >
                {chat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
});

export default HistoryModal;
