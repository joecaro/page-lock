'use client';

interface Record {
  id: string;
  title: string;
  content: string;
}

interface RecordListItemProps {
  record: Record;
  onSelect: (record: Record) => void;
}

export function RecordListItem({ record, onSelect }: RecordListItemProps) {
  return (
    <div 
      className="border rounded-lg p-4 mb-4 bg-white dark:bg-gray-800 shadow-2xs hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(record)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{record.title}</h3>
          <p className="text-sm text-gray-500">ID: {record.id}</p>
        </div>
        <button 
          className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded-full text-xs hover:bg-blue-600 dark:hover:bg-blue-700"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(record);
          }}
        >
          Open
        </button>
      </div>
      
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
        {record.content}
      </div>
    </div>
  );
} 