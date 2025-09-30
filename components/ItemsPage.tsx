import React, { useState, useMemo } from 'react';
import { ItemRecord, ItemType } from '../types';
import { PlusIcon, SearchIcon, EditIcon, TrashIcon, GridViewIcon, ListIcon } from './Icons';
import { format } from 'date-fns';

interface ItemsPageProps {
  items: ItemRecord[];
  onAddItem: (item: ItemRecord) => void;
  onUpdateItem: (item: ItemRecord) => void;
  onDeleteItem: (id: string) => void;
  openModal: (item?: ItemRecord, type?: ItemType) => void;
}

const statusColors: { [key in ItemRecord['status']]: string } = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  Matched: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  Claimed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  Returned: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
};

const ItemCard: React.FC<{ item: ItemRecord; onEdit: () => void; onDelete: () => void; }> = ({ item, onEdit, onDelete }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 hover:shadow-xl transition-all duration-300">
        <img className="w-full h-40 object-cover" src={item.itemPictureUrl} alt={item.name} />
        <div className="p-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
                </div>
                <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${statusColors[item.status]}`}>
                    {item.status}
                </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{item.description}</p>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                <p><strong>Location:</strong> {item.location}</p>
                <p><strong>Date:</strong> {format(new Date(item.date), 'PPp')}</p>
            </div>
        </div>
        <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-2">
            <button onClick={onEdit} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                <EditIcon className="w-5 h-5"/>
            </button>
            <button onClick={onDelete} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                <TrashIcon className="w-5 h-5"/>
            </button>
        </div>
    </div>
);


const ItemsPage: React.FC<ItemsPageProps> = ({ items, openModal, onDeleteItem }) => {
  const [activeTab, setActiveTab] = useState<ItemType>('Lost');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('grid');

  const filteredItems = useMemo(() => {
    return items
      .filter(item => item.type === activeTab)
      .filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [items, activeTab, searchTerm]);
  
  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Type', 'Category', 'Description', 'Location', 'Date', 'Status'];
    const rows = filteredItems.map(item =>
      [item.id, item.name, item.type, item.category, `"${item.description.replace(/"/g, '""')}"`, item.location, item.date, item.status].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab.toLowerCase()}_items_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Items</h1>
         <div className="flex items-center gap-2">
           <button onClick={exportToCSV} className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-100 border border-transparent rounded-md hover:bg-primary-200 dark:bg-primary-900/50 dark:text-primary-300 dark:hover:bg-primary-900">
             Export CSV
           </button>
          <button
            onClick={() => openModal(undefined, activeTab)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700"
          >
            <PlusIcon className="w-5 h-5" />
            Add {activeTab} Item
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex border-b border-gray-200 dark:border-slate-700 sm:border-b-0">
                    <button
                        onClick={() => setActiveTab('Lost')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'Lost' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Lost Items ({items.filter(i => i.type === 'Lost').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('Found')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'Found' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Found Items ({items.filter(i => i.type === 'Found').length})
                    </button>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full py-2 pl-10 pr-3 leading-5 text-gray-900 placeholder-gray-500 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                     <div className="flex p-1 bg-gray-200 dark:bg-slate-700 rounded-lg">
                        <button onClick={() => setView('list')} className={`p-1.5 rounded-md ${view === 'list' ? 'bg-white dark:bg-slate-600 text-primary-600' : 'text-gray-500 dark:text-gray-400'}`}><ListIcon className="w-5 h-5" /></button>
                        <button onClick={() => setView('grid')} className={`p-1.5 rounded-md ${view === 'grid' ? 'bg-white dark:bg-slate-600 text-primary-600' : 'text-gray-500 dark:text-gray-400'}`}><GridViewIcon className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>
        </div>

        {view === 'list' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Item</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Location</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Date</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Status</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <img className="w-10 h-10 rounded-full object-cover" src={item.itemPictureUrl} alt={item.name} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{item.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">{item.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">{format(new Date(item.date), 'PPp')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${statusColors[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-4">
                            <button onClick={() => openModal(item)} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                                <EditIcon className="w-5 h-5"/>
                            </button>
                            <button onClick={() => onDeleteItem(item.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => (
                    <ItemCard key={item.id} item={item} onEdit={() => openModal(item)} onDelete={() => onDeleteItem(item.id)} />
                ))}
            </div>
        )}
        
        {filteredItems.length === 0 && (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No items found.
            </div>
        )}
      </div>
    </div>
  );
};

export default ItemsPage;