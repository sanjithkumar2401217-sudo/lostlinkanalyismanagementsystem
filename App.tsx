import React, { useState, useEffect, useCallback } from 'react';
import { Page, ItemRecord, ItemType } from './types';
import { db } from './firebase';
import { ref, onValue, set, remove, push, update } from 'firebase/database';
import Dashboard from './components/Dashboard';
import ItemsPage from './components/ItemsPage';
import HandoverPage from './components/HandoverPage';
import ItemModal from './components/ItemModal';
import LoginPage from './components/LoginPage';
import { DashboardIcon, ListIcon, SunIcon, MoonIcon, MenuIcon, XIcon, LogoutIcon, HandoverIcon } from './components/Icons';

// --- Reusable Hooks ---
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};

// --- App Component ---
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage('isAuthenticated', false);
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>('DASHBOARD');
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ItemRecord | null>(null);
  const [defaultModalType, setDefaultModalType] = useState<ItemType>('Lost');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Firebase data listener
  useEffect(() => {
    const itemsRef = ref(db, 'items/');
    const unsubscribe = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const itemsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setItems(itemsList);
      } else {
        setItems([]);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
  }

  const findMatch = useCallback((newItem: ItemRecord) => {
    if (newItem.status !== 'Pending' || !newItem.id) return;

    let potentialMatches: ItemRecord[] = [];
    if (newItem.type === 'Found') {
        potentialMatches = items.filter(i => i.type === 'Lost' && i.status === 'Pending');
    } else { // type is 'Lost'
        potentialMatches = items.filter(i => i.type === 'Found' && i.status === 'Pending');
    }

    const bestMatch = potentialMatches.find(p => 
        p.category.toLowerCase() === newItem.category.toLowerCase() &&
        (p.name.toLowerCase().includes(newItem.name.toLowerCase()) || newItem.name.toLowerCase().includes(p.name.toLowerCase()))
    );

    if (bestMatch) {
      const updates: { [key: string]: any } = {};
      updates[`/items/${newItem.id}/status`] = 'Matched';
      updates[`/items/${newItem.id}/matchId`] = bestMatch.id;
      updates[`/items/${bestMatch.id}/status`] = 'Matched';
      updates[`/items/${bestMatch.id}/matchId`] = newItem.id;
      
      update(ref(db), updates);

      alert(`Potential match found for ${newItem.name}! Item ID: ${bestMatch.id}`);
    }
  }, [items]);


  const handleSaveItem = (item: Omit<ItemRecord, 'id'> & { id?: string }) => {
    if (item.id) { // Update existing item
      const { id, ...itemData } = item;
      set(ref(db, `items/${id}`), itemData);
    } else { // Create new item
      const { id, ...itemData } = item;
      const newItemRef = push(ref(db, 'items'));
      set(newItemRef, itemData).then(() => {
        const newItemWithId = { ...itemData, id: newItemRef.key! } as ItemRecord;
        findMatch(newItemWithId);
      });
    }
    setItemToEdit(null);
  };
  
  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      remove(ref(db, `items/${id}`));
    }
  };
  
  const openModal = (item?: ItemRecord, type?: ItemType) => {
    setItemToEdit(item || null);
    if (item) {
        setDefaultModalType(item.type);
    } else if (type) {
        setDefaultModalType(type);
    }
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setItemToEdit(null);
  };
  

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'DASHBOARD':
        return <Dashboard items={items} />;
      case 'ITEMS':
        return <ItemsPage items={items} onAddItem={handleSaveItem as any} onUpdateItem={handleSaveItem as any} onDeleteItem={handleDeleteItem} openModal={openModal} />;
      case 'HANDOVER':
        return <HandoverPage items={items} openModal={openModal} />;
      default:
        return <Dashboard items={items} />;
    }
  };
  
  const NavItem: React.FC<{ page: Page; label: string; icon: React.ReactNode }> = ({ page, label, icon }) => (
    <li className="relative">
      <button
        onClick={() => {
            setCurrentPage(page);
            setSidebarOpen(false);
        }}
        className={`flex items-center w-full p-2 text-base rounded-lg transition duration-75 group ${currentPage === page ? 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700'}`}
      >
        {icon}
        <span className="ml-3">{label}</span>
      </button>
       {currentPage === page && <div className="absolute left-0 top-0 h-full w-1 bg-primary-500 rounded-r-full"></div>}
    </li>
  );
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200">
      {/* Sidebar */}
       <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 border-r border-gray-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg`}>
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <a href="#" className="flex items-center pl-2.5">
              <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Lost Link</span>
            </a>
            <button onClick={() => setSidebarOpen(false)} className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
                <XIcon className="w-6 h-6" />
            </button>
          </div>
          <ul className="space-y-2">
            <NavItem page="DASHBOARD" label="Dashboard" icon={<DashboardIcon className="w-6 h-6" />} />
            <NavItem page="ITEMS" label="Items" icon={<ListIcon className="w-6 h-6" />} />
            <NavItem page="HANDOVER" label="Handover Records" icon={<HandoverIcon className="w-6 h-6" />} />
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col sm:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
             <button onClick={() => setSidebarOpen(true)} className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
                <MenuIcon className="w-6 h-6" />
            </button>
            <div className="sm:hidden"></div> {/* Spacer */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <LogoutIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      <ItemModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
        defaultType={defaultModalType}
      />
    </div>
  );
};

export default App;