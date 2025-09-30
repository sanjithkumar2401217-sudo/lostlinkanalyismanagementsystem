import React, { useState, useEffect } from 'react';
import { ItemRecord, ItemType, ItemStatus } from '../types';
import { XIcon } from './Icons';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ItemRecord, 'id'> & { id?: string }) => void;
  itemToEdit?: ItemRecord | null;
  defaultType: ItemType;
}

const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, onSave, itemToEdit, defaultType }) => {
  const getInitialState = () => {
    const baseState = {
        id: undefined as string | undefined,
        name: '',
        type: defaultType,
        category: '',
        description: '',
        location: '',
        date: new Date().toISOString().substring(0, 16),
        itemPictureUrl: `https://picsum.photos/seed/${Date.now()}/200/200`,
        status: 'Pending' as ItemStatus,
        ownerDetails: { registerNumber: '', year: undefined as number | undefined, dept: '' },
        handoverDetails: { name: '', faculty: '', dept: '', cabinNo: '' },
    };

    if (itemToEdit) {
        return {
            ...baseState,
            ...itemToEdit,
            date: new Date(itemToEdit.date).toISOString().substring(0, 16),
            ownerDetails: itemToEdit.ownerDetails || baseState.ownerDetails,
            handoverDetails: itemToEdit.handoverDetails || baseState.handoverDetails,
        };
    }
    return {...baseState, type: defaultType };
  }

  const [item, setItem] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      setItem(getInitialState());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemToEdit, defaultType, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    const val = (e.target as HTMLInputElement).type === 'number' ? (value === '' ? undefined : parseInt(value, 10)) : value;

    if (name.includes('.')) {
        const [outer, inner] = name.split('.');
        setItem(prev => ({
            ...prev,
            [outer]: { ...(prev[outer as keyof typeof prev] as object), [inner]: val },
        }));
    } else {
        setItem(prev => ({ ...prev, [name]: val as string & number & ItemStatus & ItemType }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToSave = {
      ...item,
      date: new Date(item.date).toISOString(),
      ownerDetails: item.type === 'Lost' && item.ownerDetails?.registerNumber ? { ...item.ownerDetails, year: item.ownerDetails.year! } : undefined,
      handoverDetails: (item.status === 'Claimed' || item.status === 'Returned') && item.handoverDetails?.name ? item.handoverDetails : undefined,
    };
    onSave(itemToSave);
    onClose();
  };

  if (!isOpen) return null;

  const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{itemToEdit ? 'Edit' : 'Add'} {item.type} Item</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Item Name</label>
            <input type="text" name="name" value={item.name} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <input type="text" name="category" value={item.category} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={item.description} onChange={handleChange} rows={3} className={inputClass}></textarea>
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input type="text" name="location" value={item.location} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Date and Time</label>
            <input type="datetime-local" name="date" value={item.date} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={item.status} onChange={handleChange} className={inputClass}>
                {(['Pending', 'Matched', 'Claimed', 'Returned'] as ItemStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
          </div>

          {item.type === 'Lost' && (
            <div className="space-y-4 p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Owner Details</h3>
              <div>
                <label className={labelClass}>Register Number</label>
                <input type="text" name="ownerDetails.registerNumber" value={item.ownerDetails?.registerNumber || ''} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Year</label>
                <input type="number" name="ownerDetails.year" value={item.ownerDetails?.year || ''} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Department</label>
                <input type="text" name="ownerDetails.dept" value={item.ownerDetails?.dept || ''} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          )}

          {(item.status === 'Claimed' || item.status === 'Returned') && (
            <div className="space-y-4 p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Handover Details</h3>
                 <div>
                    <label className={labelClass}>Handover To (Name)</label>
                    <input type="text" name="handoverDetails.name" value={item.handoverDetails?.name || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Faculty</label>
                    <input type="text" name="handoverDetails.faculty" value={item.handoverDetails?.faculty || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Department</label>
                    <input type="text" name="handoverDetails.dept" value={item.handoverDetails?.dept || ''} onChange={handleChange} className={inputClass} />
                </div>
                 <div>
                    <label className={labelClass}>Cabin No.</label>
                    <input type="text" name="handoverDetails.cabinNo" value={item.handoverDetails?.cabinNo || ''} onChange={handleChange} className={inputClass} />
                </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemModal;