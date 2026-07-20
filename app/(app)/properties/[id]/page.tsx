'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Building2 } from 'lucide-react';
import BuildingDetail from '@/features/properties/BuildingDetail';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useRent } from '@/store/rent-store';
import {
  useProperties,
  useRooms,
  usePropertyMutations,
  useRoomMutations,
} from '@/features/properties/properties.queries';
import { useLogAction } from '@/features/activity/activity.queries';

export default function BuildingDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const t = useTranslations('Properties');
  const { activeRole, lang } = useRent();

  const { data: properties = [], isLoading: lProperties } = useProperties();
  const { data: rooms = [], isLoading: lRooms } = useRooms();
  const propertyMut = usePropertyMutations();
  const roomMut = useRoomMutations();
  const logAction = useLogAction();

  if (lProperties || lRooms) {
    return (
      <PageTransition>
        <PageSkeleton />
      </PageTransition>
    );
  }

  const property = properties.find((p) => p.id === id);

  if (!property) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back_to_buildings')}
          </Link>
          <EmptyState icon={Building2} title={t('building_not_found')} className="p-12 shadow-xs" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <BuildingDetail
        property={property}
        rooms={rooms}
        activeRole={activeRole}
        lang={lang}
        onAddRoom={(room) => roomMut.create.mutate(room)}
        onUpdateRoom={(room) => roomMut.update.mutate(room)}
        onDeleteRoom={(roomId) => roomMut.remove.mutate(roomId)}
        onDeleteProperty={(propId) => propertyMut.remove.mutate(propId)}
        logAction={logAction}
      />
    </PageTransition>
  );
}
