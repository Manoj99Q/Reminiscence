import { DiaryEntryResponse } from '@/types/diary';

type ImagePosition = 'left' | 'right' | 'center';

// Function to determine image position for each entry
function getImagePosition(id: string): ImagePosition {
  // Use the entry ID to deterministically assign a position
  // Removing offset positions as they can cause overflow issues
  const positions: ImagePosition[] = ['left', 'right', 'center'];
  const index = parseInt(id, 16) % positions.length;
  return positions[index];
}

// Function to get image container classes based on position
function getImageClasses(position: ImagePosition): string {
  switch (position) {
    case 'left':
      return 'float-left mr-8 mb-4 w-1/3 relative z-10';
    case 'right':
      return 'float-right ml-8 mb-4 w-1/3 relative z-10';
    case 'center':
      return 'float-none w-1/3 mx-auto mb-4 relative z-10';
    default:
      return 'float-right ml-8 mb-4 w-1/3 relative z-10';
  }
}

interface DiaryEntryProps {
  entry: DiaryEntryResponse & { isLoading?: boolean };
}

function DiaryEntry({ entry }: DiaryEntryProps) {
  const imagePosition = getImagePosition(entry.id);
  const imageClasses = getImageClasses(imagePosition);

  return (
    <div className="p-8 overflow-hidden">
      {/* Title and Date Header */}
      <div className="mb-6 pr-4">
        <h2 className="font-handwriting text-2xl text-amber-800">{entry.title}</h2>
        <p className="font-handwriting text-sm text-amber-600 italic">
          {new Date(entry.entryDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Content with Dynamic Image Position */}
      <div className="relative">
        {imagePosition === 'center' ? (
          // Center layout with text on both sides
          <div className="flex gap-8">
            {/* Left text */}
            <div className="w-1/3 relative">
              <div 
                className="absolute inset-0 pointer-events-none rounded-xl -z-10"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(transparent, transparent 31px, #f3d5b5 31px, #f3d5b5 32px),
                    linear-gradient(to right, #fbbf24 1px, transparent 1px)
                  `,
                  backgroundSize: '100% 32px, 2px 100%',
                  backgroundPosition: '0 8px, 32px 0'
                }}
              />
              <p 
                className="font-handwriting text-lg leading-8 text-gray-800 whitespace-pre-wrap pl-10"
                style={{
                  lineHeight: '32px',
                  paddingTop: '8px'
                }}
              >
                {entry.content.slice(0, Math.ceil(entry.content.length / 2))}
              </p>
            </div>

            {/* Center image */}
            <div className={imageClasses}>
              {entry.isLoading ? (
                <div className="aspect-square w-full flex items-center justify-center bg-[#fdfaf7]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-2"></div>
                    <p className="font-handwriting text-amber-600">Capturing this moment...</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-square relative shadow-md">
                  <img
                    src={entry.imageUrl}
                    alt="Generated from entry"
                    className="rounded-xl w-full h-full object-cover border border-amber-100"
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* Right text */}
            <div className="w-1/3 relative">
              <div 
                className="absolute inset-0 pointer-events-none rounded-xl -z-10"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(transparent, transparent 31px, #f3d5b5 31px, #f3d5b5 32px),
                    linear-gradient(to right, #fbbf24 1px, transparent 1px)
                  `,
                  backgroundSize: '100% 32px, 2px 100%',
                  backgroundPosition: '0 8px, 32px 0'
                }}
              />
              <p 
                className="font-handwriting text-lg leading-8 text-gray-800 whitespace-pre-wrap pl-10"
                style={{
                  lineHeight: '32px',
                  paddingTop: '8px'
                }}
              >
                {entry.content.slice(Math.ceil(entry.content.length / 2))}
              </p>
            </div>
          </div>
        ) : (
          // Regular left/right layout
          <>
            {/* Image Section - Dynamic Position */}
            <div className={imageClasses}>
              {entry.isLoading ? (
                <div className="aspect-square w-full flex items-center justify-center bg-[#fdfaf7]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-2"></div>
                    <p className="font-handwriting text-amber-600">Capturing this moment...</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-square relative shadow-md">
                  <img
                    src={entry.imageUrl}
                    alt="Generated from entry"
                    className="rounded-xl w-full h-full object-cover border border-amber-100"
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* Text Content - Wraps around image */}
            <div className="relative min-h-[16rem]">
              {/* Background lines */}
              <div 
                className="absolute inset-0 pointer-events-none rounded-xl -z-10"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(transparent, transparent 31px, #f3d5b5 31px, #f3d5b5 32px),
                    linear-gradient(to right, #fbbf24 1px, transparent 1px)
                  `,
                  backgroundSize: '100% 32px, 2px 100%',
                  backgroundPosition: '0 8px, 32px 0'
                }}
              />
              <p 
                className="font-handwriting text-lg leading-8 text-gray-800 whitespace-pre-wrap pl-10"
                style={{
                  lineHeight: '32px',
                  paddingTop: '8px'
                }}
              >
                {entry.content}
              </p>
            </div>
          </>
        )}
        
        {/* Clear float */}
        <div className="clear-both" />
      </div>
    </div>
  );
}

interface DiaryEntriesProps {
  entries: (DiaryEntryResponse & { isLoading?: boolean })[];
}

export default function DiaryEntries({ entries }: DiaryEntriesProps) {
  return (
    <div className="bg-[#fdfaf7] rounded-2xl shadow-lg border border-amber-100">
      <div>
        {entries.map((entry) => (
          <DiaryEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
} 