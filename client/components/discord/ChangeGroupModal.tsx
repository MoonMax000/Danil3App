import { useState } from 'react';
import { X, ChevronRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChangeGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeGroupModal = ({ isOpen, onClose }: ChangeGroupModalProps) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col gap-4 overflow-y-auto rounded-l-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-6 backdrop-blur-[50px] scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-purple hover:opacity-80 transition-opacity"
          >
            <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4.5L6 8.5L10 12.5" stroke="#A06AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[15px] font-bold">Back</span>
          </button>
          <h2 className="text-2xl font-bold text-white">Change Group</h2>
          <button className="text-[15px] font-bold text-purple hover:opacity-80 transition-opacity">
            Apply
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-8">
          {/* Group Info */}
          <div className="flex flex-col items-center gap-6 px-0">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-l from-purple to-darkPurple">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-[19px] font-bold text-white">Group Name</h3>
              <p className="text-[15px] text-[#B0B0B0]">N members</p>
            </div>

            {/* Form Fields */}
            <div className="flex w-full flex-col gap-4">
              {/* Group Name Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-white">
                  Group name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Name"
                  className="h-11 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] px-4 text-[15px] font-bold text-white placeholder:text-[#B0B0B0] outline-none backdrop-blur-[50px] focus:border-purple transition-colors"
                />
              </div>

              {/* Description Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-white">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="(You can provide description for the group)"
                  className="h-11 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] px-4 text-[15px] text-white placeholder:text-[#B0B0B0] outline-none backdrop-blur-[50px] focus:border-purple transition-colors"
                />
              </div>
            </div>

            {/* Settings List */}
            <div className="flex w-full flex-col gap-4">
              {/* Group Type */}
              <button className="flex items-center justify-between hover:bg-white/5 rounded-lg transition-colors p-2 -m-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-[#6AA5FF]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.5128 16.666H15.9213C16.8794 16.666 17.6416 16.2294 18.3259 15.619C20.0643 14.0682 15.9778 12.4993 14.5827 12.4993M12.916 4.22332C13.1053 4.18579 13.3018 4.16602 13.5033 4.16602C15.0199 4.16602 16.2493 5.28531 16.2493 6.66602C16.2493 8.04672 15.0199 9.16602 13.5033 9.16602C13.3018 9.16602 13.1053 9.14627 12.916 9.10868" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M3.73443 13.426C2.75195 13.9525 0.175949 15.0276 1.7449 16.3728C2.51133 17.03 3.36493 17.5 4.4381 17.5H10.5619C11.6351 17.5 12.4887 17.03 13.2551 16.3728C14.8241 15.0276 12.2481 13.9525 11.2656 13.426C8.96167 12.1913 6.03833 12.1913 3.73443 13.426Z" stroke="white" strokeWidth="1.5"/>
                      <path d="M10.8327 6.24935C10.8327 8.0903 9.34027 9.58268 7.49935 9.58268C5.6584 9.58268 4.16602 8.0903 4.16602 6.24935C4.16602 4.4084 5.6584 2.91602 7.49935 2.91602C9.34027 2.91602 10.8327 4.4084 10.8327 6.24935Z" stroke="white" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <span className="text-[15px] font-bold text-white">Group Type</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[15px] text-white">Private</span>
                  <ChevronRight className="h-5 w-5 text-[#B0B0B0]" strokeWidth={1.5} />
                </div>
              </button>

              {/* Reactions */}
              <button className="flex items-center justify-between hover:bg-white/5 rounded-lg transition-colors p-2 -m-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-[#EF454A]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.2182 3.32846C13.9834 1.95769 12.033 2.51009 10.8613 3.39001C10.3808 3.7508 10.1407 3.93119 9.99935 3.93119C9.85801 3.93119 9.61785 3.7508 9.13735 3.39001C7.9657 2.51009 6.01526 1.95769 3.78055 3.32846C0.84774 5.12745 0.184115 11.0624 6.94896 16.0695C8.23745 17.0232 8.88168 17.5 9.99935 17.5C11.117 17.5 11.7613 17.0232 13.0498 16.0695C19.8146 11.0624 19.1509 5.12745 16.2182 3.32846Z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="text-[15px] font-bold text-white">Reactions</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[15px] text-white">All</span>
                  <ChevronRight className="h-5 w-5 text-[#B0B0B0]" strokeWidth={1.5} />
                </div>
              </button>

              {/* Chat History */}
              <div className="flex items-center justify-between p-2 -m-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-[#2EBD85]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_1_121454)">
                        <path d="M16.666 7.49935C16.0033 4.17814 12.9267 1.66602 9.2321 1.66602C5.05392 1.66602 1.66602 4.87869 1.66602 8.84102C1.66602 10.7448 2.44784 12.4747 3.72314 13.7583C4.00392 14.041 4.19139 14.4272 4.11573 14.8246C3.99087 15.4744 3.7079 16.0806 3.29356 16.5858C4.38371 16.7868 5.51724 16.6058 6.48936 16.0933C6.83301 15.9122 7.00482 15.8216 7.12607 15.8032C7.21095 15.7903 7.32151 15.8023 7.49935 15.8328" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.16602 13.5508C9.16602 15.9722 11.2183 17.9355 13.7493 17.9355C14.0469 17.9358 14.3437 17.9083 14.636 17.8535C14.8464 17.8139 14.9517 17.7942 15.0251 17.8054C15.0985 17.8166 15.2027 17.872 15.4108 17.9827C15.9997 18.2958 16.6863 18.4064 17.3468 18.2836C17.0958 17.9749 16.9243 17.6045 16.8487 17.2073C16.8028 16.9645 16.9164 16.7285 17.0865 16.5558C17.8591 15.7713 18.3327 14.7142 18.3327 13.5508C18.3327 11.1293 16.2803 9.16602 13.7493 9.16602C11.2183 9.16602 9.16602 11.1293 9.16602 13.5508Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_1_121454">
                          <rect width="20" height="20" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <span className="text-[15px] font-bold text-white">Chat History for New Members</span>
                </div>
                <span className="text-[15px] text-white">Hidden</span>
              </div>

              {/* Topics */}
              <button className="flex items-center justify-between hover:bg-white/5 rounded-lg transition-colors p-2 -m-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-[#6AA5FF]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.66602 4.16602H16.666" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M3.33398 4.16602H3.34147" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.33398 10H3.34147" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.33398 15.834H3.34147" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6.66602 10H16.666" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M6.66602 15.834H16.666" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="text-[15px] font-bold text-white">Topics</span>
                </div>
                <ChevronRight className="h-5 w-5 text-[#B0B0B0]" strokeWidth={1.5} />
              </button>

              {/* Description */}
              <p className="text-xs font-bold text-[#B0B0B0] -mt-2">
                The group chat will be split into topics created by admins and users.
              </p>

              {/* Members */}
              <button className="flex items-center justify-between hover:bg-white/5 rounded-lg transition-colors p-2 -m-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-[#6AA5FF]">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[15px] font-bold text-white">Members</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[15px] text-white">1</span>
                  <ChevronRight className="h-5 w-5 text-[#B0B0B0]" strokeWidth={1.5} />
                </div>
              </button>

              {/* Invite Links */}
              <button className="flex items-center justify-between hover:bg-white/5 rounded-lg transition-colors p-2 -m-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-purple">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_1_121491)">
                        <path d="M14.1355 7.48564C14.1335 5.02718 14.0963 3.75377 13.3806 2.88184C13.2424 2.71345 13.088 2.55906 12.9197 2.42087C11.9997 1.66602 10.6332 1.66602 7.8998 1.66602C5.16648 1.66602 3.79982 1.66602 2.87997 2.42087C2.71157 2.55905 2.55716 2.71345 2.41896 2.88184C1.66406 3.80163 1.66406 5.1682 1.66406 7.90132C1.66406 10.6345 1.66406 12.001 2.41896 12.9208C2.55715 13.0891 2.71157 13.2436 2.87997 13.3817C3.75195 14.0974 5.02546 14.1346 7.48408 14.1366" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11.6893 7.51989L14.1607 7.48438M11.6777 18.3339L14.149 18.2983M18.3087 11.6845L18.2854 14.1509M7.50768 11.6958L7.48438 14.1622M9.57182 7.51989C8.87783 7.64419 7.76392 7.77204 7.50768 9.20677M16.2446 18.2983C16.9404 18.1847 18.0562 18.0739 18.3345 16.6433M16.2446 7.51989C16.9386 7.64419 18.0525 7.77204 18.3087 9.20677M9.58241 18.2972C8.88841 18.1733 7.7744 18.046 7.51738 16.6114" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_1_121491">
                          <rect width="20" height="20" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <span className="text-[15px] font-bold text-white">Invite Links</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[15px] text-white">1</span>
                  <ChevronRight className="h-5 w-5 text-[#B0B0B0]" strokeWidth={1.5} />
                </div>
              </button>

              {/* Permissions */}
              <button className="flex items-center justify-between hover:bg-white/5 rounded-lg transition-colors p-2 -m-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-[#FFA800]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.9173 12.084C15.6787 12.084 17.9173 9.8454 17.9173 7.08398C17.9173 4.32256 15.6787 2.08398 12.9173 2.08398C10.1559 2.08398 7.91732 4.32256 7.91732 7.08398C7.91732 7.81766 8.07533 8.5144 8.35923 9.14207L2.08398 15.4173V17.9173H4.58398V16.2507H6.25065V14.584H7.91732L10.8592 11.6421C11.4869 11.926 12.1837 12.084 12.9173 12.084Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14.5833 5.41602L13.75 6.24935" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[15px] font-bold text-white">Permissions</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[15px] text-white">13/13</span>
                  <ChevronRight className="h-5 w-5 text-[#B0B0B0]" strokeWidth={1.5} />
                </div>
              </button>

              {/* Admins */}
              <button className="flex items-center justify-between hover:bg-white/5 rounded-lg transition-colors p-2 -m-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-[#2EBD85]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.5 9.31877V6.89959C17.5 5.53292 17.5 4.84958 17.1632 4.40376C16.8265 3.95792 16.0651 3.74148 14.5423 3.3086C13.5018 3.01285 12.5847 2.65654 11.8519 2.33126C10.8528 1.88777 10.3533 1.66602 10 1.66602C9.64667 1.66602 9.14717 1.88777 8.14809 2.33126C7.41532 2.65654 6.4982 3.01284 5.45778 3.3086C3.93494 3.74148 3.17352 3.95792 2.83676 4.40376C2.5 4.84958 2.5 5.53292 2.5 6.89959V9.31877C2.5 14.0064 6.71897 16.8189 8.82833 17.9322C9.33425 18.1992 9.58717 18.3327 10 18.3327C10.4128 18.3327 10.6657 18.1992 11.1717 17.9322C13.281 16.8189 17.5 14.0064 17.5 9.31877Z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="text-[15px] font-bold text-white">Admins</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[15px] text-white">1</span>
                  <ChevronRight className="h-5 w-5 text-[#B0B0B0]" strokeWidth={1.5} />
                </div>
              </button>

              {/* Recent Activity */}
              <button className="flex items-center justify-between hover:bg-white/5 rounded-lg transition-colors p-2 -m-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-[#FFA800]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.9527 9.20352C18.206 9.55877 18.3327 9.73643 18.3327 9.99935C18.3327 10.2623 18.206 10.4399 17.9527 10.7952C16.8143 12.3915 13.907 15.8327 9.99935 15.8327C6.09167 15.8327 3.18443 12.3915 2.04605 10.7952C1.79269 10.4399 1.66602 10.2623 1.66602 9.99935C1.66602 9.73643 1.79269 9.55877 2.04605 9.20352C3.18443 7.60722 6.09167 4.16602 9.99935 4.16602C13.907 4.16602 16.8143 7.60722 17.9527 9.20352Z" stroke="white" strokeWidth="1.5"/>
                      <path d="M12.5 10C12.5 8.61925 11.3807 7.5 10 7.5C8.61925 7.5 7.5 8.61925 7.5 10C7.5 11.3807 8.61925 12.5 10 12.5C11.3807 12.5 12.5 11.3807 12.5 10Z" stroke="white" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <span className="text-[15px] font-bold text-white">Recent Activity</span>
                </div>
                <ChevronRight className="h-5 w-5 text-[#B0B0B0]" strokeWidth={1.5} />
              </button>

              {/* Delete Button */}
              <button className="mt-2 flex h-[26px] items-center justify-center rounded-lg bg-[#3A2127] transition-opacity hover:opacity-80">
                <span className="text-[15px] font-bold text-[#EF454A]">Delete Group</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
