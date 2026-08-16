"use client";

import * as React from "react";
import { Check, ImagePlus, Palette, RotateCcw } from "lucide-react";
import { aPlusCharcoalAccentColor, applyAccentColor, applyColorPreset, colorPresetStorageKey, defaultAccentColor, type ColorPreset } from "@/components/appearance-provider";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AppearanceSettings() {
  const [color, setColor] = React.useState(defaultAccentColor);
  const [preset, setPreset] = React.useState<ColorPreset>("tet-red");
  const [logoName, setLogoName] = React.useState("");

  React.useEffect(() => {
    const saved = window.localStorage.getItem("edge-journal-accent-color");
    const savedValue = window.localStorage.getItem(colorPresetStorageKey);
    const savedPreset = savedValue === "aplus-charcoal" ? "aplus-charcoal" : "tet-red";
    setPreset(savedPreset);
    if (saved) setColor(saved);
  }, []);

  const setAccent = (nextColor: string) => {
    setColor(nextColor);
    window.localStorage.setItem("edge-journal-accent-color", nextColor);
    applyAccentColor(nextColor);
  };

  const setColorPreset = (nextPreset: ColorPreset) => {
    const nextColor = nextPreset === "aplus-charcoal" ? aPlusCharcoalAccentColor : defaultAccentColor;
    setPreset(nextPreset);
    setAccent(nextColor);
    window.localStorage.setItem(colorPresetStorageKey, nextPreset);
    applyColorPreset(nextPreset);
  };

  const uploadLogo = (file?: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      window.localStorage.setItem("tet-community-logo", String(reader.result));
      window.dispatchEvent(new Event("tet-community-logo"));
      setLogoName(file.name);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="glass-panel xl:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="size-5 text-primary" />
          Appearance
        </CardTitle>
        <CardDescription>Dooro color kasta oo aad rabto adigoo jiidaya picker-ka, kuna upload-garee logo profile-kaaga.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-3 lg:col-span-2">
          <Label>Color style presets</Label>
          <div className="grid gap-3 md:grid-cols-2">
            <PresetButton
              active={preset === "tet-red"}
              title="TET Red"
              description="Default red trading SaaS style."
              colors={["#ef1018", "#0f172a", "#ffffff"]}
              onClick={() => setColorPreset("tet-red")}
            />
            <PresetButton
              active={preset === "aplus-charcoal"}
              title="A+ Charcoal"
              description="Animated charcoal, white, and clean red style."
              colors={[aPlusCharcoalAccentColor, "#2e2e2e", "#f2f2f2"]}
              animated
              onClick={() => setColorPreset("aplus-charcoal")}
            />
          </div>
        </div>

        <div className="grid gap-3">
          <Label>Unlimited accent color</Label>
          <div className="grid gap-3 rounded-lg border bg-background/45 p-4 sm:grid-cols-[96px_1fr]">
            <Input
              type="color"
              value={color}
              className="h-20 w-full cursor-pointer p-1"
              onChange={(event) => setAccent(event.target.value)}
              aria-label="Choose any accent color"
            />
            <div className="grid content-center gap-2">
              <Input value={color} onChange={(event) => setAccent(event.target.value)} placeholder="#d4a72c" />
              <Button type="button" variant="outline" className="w-fit" onClick={() => setColorPreset("tet-red")}>
                <RotateCcw className="size-4" />
                Reset red
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <Label>Profile logo</Label>
          <div className="grid gap-3 rounded-lg border bg-background/45 p-4 sm:grid-cols-[64px_1fr]">
            <BrandMark className="size-16" />
            <div className="grid content-center gap-2">
              <Input type="file" accept="image/*" onChange={(event) => uploadLogo(event.target.files?.[0])} />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="w-fit" onClick={() => document.getElementById("logo-input-helper")?.click()}>
                  <ImagePlus className="size-4" />
                  Upload logo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-fit"
                  onClick={() => {
                    window.localStorage.removeItem("tet-community-logo");
                    window.dispatchEvent(new Event("tet-community-logo"));
                    setLogoName("");
                  }}
                >
                  Clear logo
                </Button>
              </div>
              <input id="logo-input-helper" type="file" accept="image/*" className="hidden" onChange={(event) => uploadLogo(event.target.files?.[0])} />
              <p className="text-xs text-muted-foreground">{logoName || "Logo-ga wuxuu ka muuqanayaa meesha TET Community ku qoran tahay."}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PresetButton({
  active,
  title,
  description,
  colors,
  animated = false,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  colors: string[];
  animated?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={
        active
          ? "rounded-lg border border-primary bg-primary/10 p-4 text-left ring-1 ring-primary/25 transition"
          : "rounded-lg border bg-background/45 p-4 text-left transition hover:border-primary/60"
      }
      onClick={onClick}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {colors.map((presetColor) => (
            <span key={presetColor} className="size-6 rounded-full border shadow-sm" style={{ backgroundColor: presetColor }} />
          ))}
        </div>
        {active ? <Check className="size-4 text-primary" /> : null}
      </div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      {animated ? <div className="color-preset-flow mt-3 h-2 rounded-full" /> : <div className="mt-3 h-2 rounded-full bg-primary/30" />}
    </button>
  );
}
