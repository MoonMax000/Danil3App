import { useEffect, useRef } from 'react';

interface MessageContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onShare?: () => void;
  onSelect?: () => void;
  onPin?: () => void;
  onStar?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
  canPin?: boolean;
  canDelete?: boolean;
}

const MessageContextMenu = ({
  x,
  y,
  onClose,
  onShare,
  onSelect,
  onPin,
  onStar,
  onDelete,
  isSelected = false,
  canPin = true,
  canDelete = true,
}: MessageContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleAction = (action?: () => void) => {
    if (action) action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-[240px] flex flex-col p-4 gap-3 rounded-2xl overflow-hidden border border-[#181B22] shadow-[24px_48px_48px_0_rgba(0,0,0,0.64)]"
      style={{
        left: x,
        top: y,
        background: 'rgba(11, 14, 17, 0.50)',
        backdropFilter: 'blur(50px)',
      }}
    >
      {/* Share */}
      <button
        onClick={() => handleAction(onShare)}
        className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.9775 11.8125L12.335 19.167V14.9248L11.8213 14.9385C9.7101 14.9953 8.06897 15.3005 6.7373 15.9141C5.29431 16.5791 4.26154 17.5701 3.19238 18.79L2.75 19.2949V18.7148C2.75007 15.7818 3.4111 13.5023 4.65723 11.8828C6.15326 9.93901 8.5395 8.85049 11.8545 8.71484L12.335 8.69434V4.45703L20.9775 11.8125Z" stroke="white"/>
        </svg>
        <span className="text-[15px] font-bold">Share</span>
      </button>

      {/* Select */}
      <button
        onClick={() => handleAction(onSelect)}
        className={`flex items-center gap-2.5 px-3 py-2 -mx-2 rounded-xl transition-colors ${
          isSelected ? 'bg-regaliaPurple text-white' : 'text-white hover:bg-regaliaPurple/50'
        }`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M2.25 12C2.25 6.61704 6.61704 2.25 12 2.25C17.383 2.25 21.75 6.61704 21.75 12C21.75 17.383 17.383 21.75 12 21.75C6.61704 21.75 2.25 17.383 2.25 12ZM12 3.75C7.44546 3.75 3.75 7.44546 3.75 12C3.75 16.5545 7.44546 20.25 12 20.25C16.5545 20.25 20.25 16.5545 20.25 12C20.25 7.44546 16.5545 3.75 12 3.75Z" fill="white"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M16.9824 7.67574C17.2996 7.94216 17.3407 8.41525 17.0743 8.73241L10.7743 16.2324C10.6347 16.3986 10.4299 16.4962 10.2128 16.4999C9.99576 16.5036 9.78776 16.4131 9.64254 16.2517L6.94254 13.2517C6.66544 12.9439 6.6904 12.4696 6.99828 12.1925C7.30617 11.9155 7.78038 11.9404 8.05748 12.2483L10.1805 14.6072L15.9257 7.76762C16.1921 7.45046 16.6652 7.40932 16.9824 7.67574Z" fill="white"/>
        </svg>
        <span className="text-[15px] font-bold">Select</span>
      </button>

      {/* Pin */}
      {canPin && (
      <button
        onClick={() => handleAction(onPin)}
        className="flex items-center gap-2.5 text-white hover:opacity-80 transition-opacity"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21L8 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.2585 18.8714C9.51516 18.0215 5.97844 14.4848 5.12853 10.7415C4.99399 10.1489 4.92672 9.85266 5.12161 9.37197C5.3165 8.89129 5.55457 8.74255 6.03071 8.44509C7.10705 7.77265 8.27254 7.55888 9.48209 7.66586C11.1793 7.81598 12.0279 7.89104 12.4512 7.67048C12.8746 7.44991 13.1622 6.93417 13.7376 5.90269L14.4664 4.59604C14.9465 3.73528 15.1866 3.3049 15.7513 3.10202C16.316 2.89913 16.6558 3.02199 17.3355 3.26771C18.9249 3.84236 20.1576 5.07505 20.7323 6.66449C20.978 7.34417 21.1009 7.68401 20.898 8.2487C20.6951 8.8134 20.2647 9.05346 19.4039 9.53358L18.0672 10.2792C17.0376 10.8534 16.5229 11.1406 16.3024 11.568C16.0819 11.9955 16.162 12.8256 16.3221 14.4859C16.4399 15.7068 16.2369 16.88 15.5555 17.9697C15.2577 18.4458 15.1088 18.6839 14.6283 18.8786C14.1477 19.0733 13.8513 19.006 13.2585 18.8714Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-[15px] font-bold">Pin</span>
      </button>
      )}

      {/* Star */}
      <button
        onClick={() => handleAction(onStar)}
        className="flex items-center gap-2.5 text-white hover:opacity-80 transition-opacity"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-[15px] font-bold">Star</span>
      </button>

      {/* Divider */}
      <div className="h-px bg-[#181B22]" />

      {/* Delete */}
      {canDelete && (
      <button
        onClick={() => handleAction(onDelete)}
        className="flex items-center gap-2.5 text-[#EF454A] hover:opacity-80 transition-opacity"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M5.20324 4.50149C5.61665 4.47565 5.97273 4.78983 5.99856 5.20324L6.93606 20.2032C6.93624 20.206 6.9364 20.2088 6.93654 20.2115C6.96247 20.7163 7.29759 21 7.68753 21H16.3125C16.6986 21 17.0322 20.7226 17.0639 20.2043L18.0015 5.20324C18.0273 4.78983 18.3834 4.47565 18.7968 4.50149C19.2102 4.52732 19.5244 4.8834 19.4986 5.29681L18.5611 20.2958C18.5611 20.2958 18.5611 20.2959 18.5611 20.2959C18.4868 21.5109 17.583 22.5 16.3125 22.5H7.68753C6.429 22.5 5.5039 21.5196 5.43875 20.293L4.50149 5.29681C4.47565 4.8834 4.78983 4.52732 5.20324 4.50149Z" fill="#EF454A"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M3 5.25C3 4.83579 3.33579 4.5 3.75 4.5H20.25C20.6642 4.5 21 4.83579 21 5.25C21 5.66421 20.6642 6 20.25 6H3.75C3.33579 6 3 5.66421 3 5.25Z" fill="#EF454A"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M10.1228 3C10.0738 2.99986 10.0253 3.0094 9.97998 3.02809C9.93468 3.04677 9.89353 3.07423 9.85888 3.10887C9.82423 3.14352 9.79678 3.18468 9.77809 3.22997C9.75941 3.27527 9.74986 3.32381 9.75001 3.37281L9.75001 3.375V5.25C9.75001 5.66422 9.41422 6 9.00001 6C8.5858 6 8.25001 5.66422 8.25001 5.25V3.37596C8.24945 3.12966 8.29751 2.88567 8.39143 2.65798C8.48552 2.4299 8.62376 2.22267 8.79822 2.04821C8.97268 1.87376 9.1799 1.73551 9.40798 1.64143C9.63568 1.5475 9.87967 1.49945 10.126 1.5H13.8741C14.1204 1.49945 14.3643 1.5475 14.592 1.64143C14.8201 1.73551 15.0273 1.87375 15.2018 2.04821C15.3763 2.22267 15.5145 2.4299 15.6086 2.65798C15.7025 2.88572 15.7506 3.12977 15.75 3.37612V5.25C15.75 5.66422 15.4142 6 15 6C14.5858 6 14.25 5.66422 14.25 5.25V3.375L14.25 3.37281C14.2502 3.32381 14.2406 3.27527 14.2219 3.22997C14.2032 3.18467 14.1758 3.14352 14.1411 3.10887C14.1065 3.07423 14.0653 3.04677 14.02 3.02809C13.9747 3.0094 13.9262 2.99986 13.8772 3L13.875 3H10.125L10.1228 3ZM8.59824 7.50048C9.01219 7.4857 9.35975 7.80929 9.37453 8.22324L9.74953 18.7232C9.76432 19.1372 9.44073 19.4847 9.02678 19.4995C8.61283 19.5143 8.26527 19.1907 8.25049 18.7768L7.87549 8.27677C7.8607 7.86282 8.18429 7.51527 8.59824 7.50048ZM15.4018 7.50048C15.8157 7.51527 16.1393 7.86282 16.1245 8.27677L15.7495 18.7768C15.7347 19.1907 15.3872 19.5143 14.9732 19.4995C14.5593 19.4847 14.2357 19.1372 14.2505 18.7232L14.6255 8.22324C14.6403 7.80929 14.9878 7.4857 15.4018 7.50048ZM12 7.5C12.4142 7.5 12.75 7.83579 12.75 8.25V18.75C12.75 19.1642 12.4142 19.5 12 19.5C11.5858 19.5 11.25 19.1642 11.25 18.75V8.25C11.25 7.83579 11.5858 7.5 12 7.5Z" fill="#EF454A"/>
        </svg>
        <span className="text-[15px] font-bold">Delete</span>
      </button>
      )}
    </div>
  );
};

export default MessageContextMenu;
