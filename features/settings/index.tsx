'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal, Save, Loader2, Coins } from 'lucide-react';
import { useRent } from '@/store/rent-store';
import { pickLocale } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Property } from '@/lib/types';
import { useCan, useMyPermissions } from '@/features/admin/permissions.queries';
import { useProperties } from '@/features/properties/properties.queries';
import { PasswordConfirmModal } from '@/components/shared/PasswordConfirmModal';
import { useSettings, useUpdateSettings, useUpdateZoneRates } from './settings.queries';
import { FeeCatalogCard } from './components/FeeCatalogCard';
import { PropertyFeesModal } from './components/PropertyFeesModal';

/** A save the user has requested but must confirm with their password first. */
type PendingSave =
  | {
      type: 'global';
      patch: { exchangeRateKhr: number; defaultElectricityRate: number; defaultWaterRate: number };
    }
  | { type: 'zone'; id: string; patch: { electricityRate: number | null; waterRate: number | null } };

export default function SystemSettings() {
  const t = useTranslations('Settings');
  const { mounted, sessionLoading, isSuperAdmin, lang } = useRent();
  const can = useCan();
  const router = useRouter();
  const allowed = can('admin.settings');
  const { isLoading: permissionsLoading } = useMyPermissions();
  const authReady = mounted && !sessionLoading && (isSuperAdmin || !permissionsLoading);

  useEffect(() => {
    if (authReady && !allowed) router.replace('/dashboard');
  }, [authReady, allowed, router]);

  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: properties = [], isLoading: propertiesLoading } = useProperties();
  const updateSettings = useUpdateSettings();
  const updateZone = useUpdateZoneRates();

  const [pending, setPending] = useState<PendingSave | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [feesProperty, setFeesProperty] = useState<Property | null>(null);

  function closePassword() {
    setPending(null);
    setPwError(null);
  }

  function handleConfirmPassword(password: string) {
    if (!pending) return;
    setPwError(null);
    if (pending.type === 'global') {
      updateSettings.mutate(
        { ...pending.patch, password },
        { onSuccess: closePassword, onError: (e) => setPwError(e.message) }
      );
    } else {
      updateZone.mutate(
        { id: pending.id, patch: { ...pending.patch, password } },
        { onSuccess: closePassword, onError: (e) => setPwError(e.message) }
      );
    }
  }

  if (!authReady || !allowed) {
    const label = !authReady ? t('loading') : t('redirecting');
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center text-sm text-muted-foreground italic">
        {label}
      </div>
    );
  }

  return (
    <div className="space-y-6" id="system-settings-page">
      <div className="bg-card p-4 rounded-xl border border-border shadow-3xs">
        <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-1.5 font-sans">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          {t('title')}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5 font-sans">{t('description')}</p>
      </div>

      {settingsLoading || !settings ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-sm text-muted-foreground italic">
          {t('loading')}
        </div>
      ) : (
        <GlobalRatesCard
          settings={settings}
          saving={updateSettings.isPending}
          onSave={(patch) => setPending({ type: 'global', patch })}
        />
      )}

      <div className="bg-card rounded-xl border border-border shadow-3xs">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground font-sans">{t('zone_overrides_title')}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-sans">{t('zone_overrides_desc')}</p>
        </div>

        {propertiesLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground italic">{t('loading')}</div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground italic">{t('no_zones')}</div>
        ) : (
          <div className="overflow-x-auto scroll-x-hint">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-sans dark:font-mono">
                  <th className="p-4 pl-6">{t('zone')}</th>
                  <th className="p-4">{t('electricity_rate')}</th>
                  <th className="p-4">{t('water_rate')}</th>
                  <th className="p-4 pr-6 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {properties.map((property) => (
                  <ZoneRateRow
                    key={property.id}
                    property={property}
                    name={pickLocale(lang, property.name, property.nameKh)}
                    saving={updateZone.isPending}
                    onSave={(patch) => setPending({ type: 'zone', id: property.id, patch })}
                    onManageFees={() => setFeesProperty(property)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FeeCatalogCard lang={lang} />

      {feesProperty && (
        <PropertyFeesModal
          propertyId={feesProperty.id}
          propertyName={pickLocale(lang, feesProperty.name, feesProperty.nameKh)}
          lang={lang}
          onClose={() => setFeesProperty(null)}
        />
      )}

      <PasswordConfirmModal
        open={!!pending}
        busy={updateSettings.isPending || updateZone.isPending}
        error={pwError}
        onClose={closePassword}
        onConfirm={handleConfirmPassword}
      />
    </div>
  );
}

function GlobalRatesCard({
  settings,
  saving,
  onSave,
}: {
  settings: { exchangeRateKhr: number; defaultElectricityRate: number; defaultWaterRate: number };
  saving: boolean;
  onSave: (patch: { exchangeRateKhr: number; defaultElectricityRate: number; defaultWaterRate: number }) => void;
}) {
  const t = useTranslations('Settings');
  const [exchangeRate, setExchangeRate] = useState(settings.exchangeRateKhr);
  const [elecRate, setElecRate] = useState(settings.defaultElectricityRate);
  const [waterRate, setWaterRate] = useState(settings.defaultWaterRate);

  useEffect(() => {
    setExchangeRate(settings.exchangeRateKhr);
    setElecRate(settings.defaultElectricityRate);
    setWaterRate(settings.defaultWaterRate);
  }, [settings]);

  const dirty =
    exchangeRate !== settings.exchangeRateKhr ||
    elecRate !== settings.defaultElectricityRate ||
    waterRate !== settings.defaultWaterRate;
  const valid = exchangeRate > 0 && elecRate > 0 && waterRate > 0;

  return (
    <div className="bg-card rounded-xl border border-border shadow-3xs">
      <div className="p-4 border-b border-border flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground font-sans">{t('global_rates_title')}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-sans">{t('global_rates_desc')}</p>
        </div>
        <button
          onClick={() => onSave({ exchangeRateKhr: exchangeRate, defaultElectricityRate: elecRate, defaultWaterRate: waterRate })}
          disabled={saving || !dirty || !valid}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition cursor-pointer disabled:opacity-40 shrink-0"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {t('save')}
        </button>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
            {t('exchange_rate_label')}
          </label>
          <Input
            type="number"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(Number(e.target.value))}
            min={1}
            step={10}
            className="font-mono font-bold"
          />
          <p className="text-[10px] text-muted-foreground mt-1 font-sans">{t('exchange_rate_help')}</p>
        </div>

        <div>
          <label className="text-[10px] font-bold text-chart-1 uppercase tracking-wider block mb-1 font-sans">
            {t('default_electricity_rate_label')}
          </label>
          <Input
            type="number"
            value={elecRate}
            onChange={(e) => setElecRate(Number(e.target.value))}
            min={1}
            step={50}
            className="font-mono font-bold"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-info uppercase tracking-wider block mb-1 font-sans">
            {t('default_water_rate_label')}
          </label>
          <Input
            type="number"
            value={waterRate}
            onChange={(e) => setWaterRate(Number(e.target.value))}
            min={1}
            step={100}
            className="font-mono font-bold"
          />
        </div>
      </div>
    </div>
  );
}

function ZoneRateRow({
  property,
  name,
  saving,
  onSave,
  onManageFees,
}: {
  property: Property;
  name: string;
  saving: boolean;
  onSave: (patch: { electricityRate: number | null; waterRate: number | null }) => void;
  onManageFees: () => void;
}) {
  const t = useTranslations('Settings');
  const [elec, setElec] = useState(property.electricityRate ?? '');
  const [water, setWater] = useState(property.waterRate ?? '');

  useEffect(() => {
    setElec(property.electricityRate ?? '');
    setWater(property.waterRate ?? '');
  }, [property]);

  const dirty = elec !== (property.electricityRate ?? '') || water !== (property.waterRate ?? '');

  return (
    <tr className="hover:bg-muted/50 transition">
      <td className="p-4 pl-6 font-bold text-foreground">{name}</td>
      <td className="p-4">
        <Input
          type="number"
          value={elec}
          onChange={(e) => setElec(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder={t('use_system_default')}
          min={0}
          step={50}
          className="font-mono h-8 max-w-[140px]"
        />
      </td>
      <td className="p-4">
        <Input
          type="number"
          value={water}
          onChange={(e) => setWater(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder={t('use_system_default')}
          min={0}
          step={100}
          className="font-mono h-8 max-w-[140px]"
        />
      </td>
      <td className="p-4 pr-6">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={onManageFees}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold border border-border text-foreground rounded-lg hover:border-primary/40 hover:bg-accent transition cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5" />
            {t('manage_fees')}
          </button>
          <button
            onClick={() =>
              onSave({
                electricityRate: elec === '' ? null : Number(elec),
                waterRate: water === '' ? null : Number(water),
              })
            }
            disabled={saving || !dirty}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition cursor-pointer disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {t('save')}
          </button>
        </div>
      </td>
    </tr>
  );
}
