'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Property } from '@/lib/types';

type PropType = 'apartment' | 'borey' | 'condo' | 'guesthouse';

interface Args {
  properties: Property[];
  canModify: boolean;
  onAddProperty: (prop: Omit<Property, 'totalRooms'>) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

/** Owns the buildings grid: type filter + the "add building" modal. Room
 *  concerns live on the per-building detail page (see use-rooms-controller). */
export function useBuildingsController({
  properties,
  canModify,
  onAddProperty,
  logAction,
}: Args) {
  const tCommon = useTranslations('Common');

  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'all' | PropType>('all');
  const [buildingSearch, setBuildingSearch] = useState('');
  const filteredProperties = useMemo(() => {
    const query = buildingSearch.trim().toLowerCase();
    return properties.filter((p) => {
      const matchesType = propertyTypeFilter === 'all' || p.type === propertyTypeFilter;
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.nameKh.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [properties, propertyTypeFilter, buildingSearch]);

  const [showPropModal, setShowPropModal] = useState(false);
  const [propName, setPropName] = useState('');
  const [propNameKh, setPropNameKh] = useState('');
  const [propType, setPropType] = useState<PropType>('apartment');
  const [propAddress, setPropAddress] = useState('');
  const [propAddressKh, setPropAddressKh] = useState('');

  function openPropModal() {
    setPropName('');
    setPropNameKh('');
    setPropAddress('');
    setPropAddressKh('');
    setPropType('apartment');
    setShowPropModal(true);
  }
  const closePropModal = () => setShowPropModal(false);

  function handleCreateProp(e: React.FormEvent) {
    e.preventDefault();
    if (!canModify) return toast.error(tCommon('insufficient_permissions'));
    if (!propName || !propNameKh || !propAddress || !propAddressKh)
      return toast.error(tCommon('please_fill'));

    onAddProperty({
      id: 'prop-' + Date.now(),
      name: propName,
      nameKh: propNameKh,
      type: propType,
      address: propAddress,
      addressKh: propAddressKh,
    });
    logAction(
      'Added Property',
      'បានបន្ថែមទីតាំងថ្មី',
      `Added property "${propName}" with type ${propType}`,
      `បានបង្កើតទីតាំងផ្ទះជួលថ្មីឈ្មោះ "${propNameKh}" ប្រភេទ ${propType}`
    );
    setShowPropModal(false);
  }

  return {
    propertyTypeFilter,
    setPropertyTypeFilter,
    buildingSearch,
    setBuildingSearch,
    filteredProperties,
    // property modal (consumed by PropertyModal)
    showPropModal,
    openPropModal,
    closePropModal,
    propName,
    setPropName,
    propNameKh,
    setPropNameKh,
    propType,
    setPropType,
    propAddress,
    setPropAddress,
    propAddressKh,
    setPropAddressKh,
    handleCreateProp,
  };
}
