import React, { useState, useMemo } from 'react';
import { ItemRecord } from '../types';
import { SearchIcon, EditIcon } from './Icons';
import { format } from 'date-fns';

interface HandoverPageProps {
  items: ItemRecord[];
  openModal: (item: ItemRecord) => void;
}

const HandoverPage: React.FC<HandoverPageProps> = ({ items, openModal }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handedOverItems = useMemo(() => {
    return items
      .filter(item => item.handoverDetails && item.handoverDetails.name) // Filter for items with handover details
      .filter(item => {
        if (!searchTerm) return true;
        const lowerSearchTerm = searchTerm.toLowerCase();
        const handover = item.handoverDetails!;
        return (
          item.name.toLowerCase().includes(lowerSearchTerm) ||
          handover.name.toLowerCase().includes(lowerSearchTerm) ||
          handover.faculty.toLowerCase().includes(lowerSearchTerm) ||
          handover.dept.toLowerCase().includes(lowerSearchTerm) ||
          handover.cabinNo.toLowerCase().includes(lowerSearchTerm)
        );
      });
  }, [items, searchTerm]);
  
  const exportToCSV = () => {
    const headers = [
        'ItemID', 'ItemName', 'Category', 
        'HandoverToName', 'Faculty', 'Department', 'CabinNo', 
        'Date'
    ];
    const rows = handedOverItems.map(item => {
        const handover = item.handoverDetails!;
        return [
            item.id, item.name, item.category,
            handover.name, handover.faculty, handover.dept, handover.cabinNo,
            item.date
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `handover_records_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Handover Records</h1>
         <div className="flex items-center gap-2">
           <button onClick={exportToCSV} className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-100 border border-transparent rounded-md hover:bg-primary-200 dark:bg-primary-900/50 dark:text-primary-300 dark:hover:bg-primary-900">
             Export CSV
           </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex justify-end">
                 <div className="relative w-full sm:w-1/2 md:w-1/3">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full py-2 pl-10 pr-3 leading-5 text-gray-900 placeholder-gray-500 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400"
                    />
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Item</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Handed Over To</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Faculty/Dept</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Cabin No.</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Date</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
              {handedOverItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <img className="w-10 h-10 rounded-full object-cover" src={item.itemPictureUrl} alt={item.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">{item.handoverDetails?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm text-gray-900 dark:text-white">{item.handoverDetails?.faculty}</div>
                     <div className="text-sm text-gray-500 dark:text-gray-400">{item.handoverDetails?.dept}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">{item.handoverDetails?.cabinNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">{format(new Date(item.date), 'PPp')}</td>
                  <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                    <button onClick={() => openModal(item)} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                        <EditIcon className="w-5 h-5"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {handedOverItems.length === 0 && (
             <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No handover records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HandoverPage;