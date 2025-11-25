import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useCompare = () => {
    const [compareList, setCompareList] = useState({
        diamonds: [],
        jewelry: []
    });

    useEffect(() => {
        const stored = localStorage.getItem('compareList');
        if (stored) {
            setCompareList(JSON.parse(stored));
        }
    }, []);

    const saveToStorage = (newList) => {
        localStorage.setItem('compareList', JSON.stringify(newList));
        setCompareList(newList);
    };

    const addToCompare = (item, type) => {
        const list = compareList[type];
        if (list.length >= 4) {
            toast.error(`You can only compare up to 4 ${type} at a time.`);
            return;
        }
        if (list.find(i => i._id === item._id)) {
            toast.info("Item already in comparison list.");
            return;
        }

        const newList = {
            ...compareList,
            [type]: [...list, item]
        };
        saveToStorage(newList);
        toast.success("Added to comparison list");
    };

    const removeFromCompare = (id, type) => {
        const newList = {
            ...compareList,
            [type]: compareList[type].filter(i => i._id !== id)
        };
        saveToStorage(newList);
        toast.success("Removed from comparison list");
    };

    const isInCompare = (id, type) => {
        return compareList[type].some(i => i._id === id);
    };

    return {
        compareList,
        addToCompare,
        removeFromCompare,
        isInCompare
    };
};
