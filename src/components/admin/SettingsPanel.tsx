import { useSettings } from '@/hooks/useSettings';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';

export const SettingsPanel = () => {
  const { getSetting, updateSetting, settings } = useSettings();
  const { toast } = useToast();
  const [swachTeaEnabled, setSwachTeaEnabled] = useState(true);

  // Update local state when settings change
  useEffect(() => {
    const value = getSetting('swach_tea_enabled');
    console.log('Setting value from hook:', value, typeof value);
    // Handle different value types
    if (value === false || value === 'false') {
      setSwachTeaEnabled(false);
    } else {
      setSwachTeaEnabled(true);
    }
  }, [settings]);

  const handleSwachTeaToggle = async (enabled: boolean) => {
    try {
      console.log('Toggling Swach Tea to:', enabled);
      setSwachTeaEnabled(enabled);
      
      await updateSetting.mutateAsync({
        key: 'swach_tea_enabled',
        value: enabled,
      });
      
      toast({
        title: 'Success',
        description: `Swach Tea partnership ${enabled ? 'enabled' : 'disabled'} on website`,
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      setSwachTeaEnabled(!enabled);
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Swach Tea Partnership Toggle */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label className="text-base font-semibold cursor-pointer">
              Swach Tea Partnership
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              When enabled, all Swach Tea branding and text will be visible on the website.
              When disabled, all references to Swach Tea will be removed from the site.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Current Status: <span className="font-semibold">{swachTeaEnabled ? '✓ Enabled' : '✗ Disabled'}</span>
            </p>
          </div>
          <Switch
            checked={swachTeaEnabled}
            onCheckedChange={handleSwachTeaToggle}
            disabled={updateSetting.isPending}
            className="ml-4"
          />
        </div>
      </Card>

      {/* Information */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2">What This Controls:</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Logo text: "FOODISTICS × Swach Tea"</li>
          <li>• About section partnerships mentions</li>
          <li>• Website title and meta descriptions</li>
          <li>• Footer copyright and branding</li>
          <li>• All internal references to the partnership</li>
        </ul>
      </Card>

      {/* Debug Info */}
      <Card className="p-6 bg-gray-50 border-gray-200">
        <h3 className="font-semibold mb-2 text-xs">Debug Info:</h3>
        <p className="text-xs text-gray-600">Settings count: {settings.length}</p>
        <p className="text-xs text-gray-600">Swach Tea Enabled: {String(swachTeaEnabled)}</p>
      </Card>
    </div>
  );
};
