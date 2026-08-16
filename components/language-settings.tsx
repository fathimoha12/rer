"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export type AppLanguage = "en" | "so";

export const languageStorageKey = "tet-community-language";
export const languageChangedEvent = "tet-community-language-change";

export function getSavedLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(languageStorageKey) === "so" ? "so" : "en";
}

export function saveLanguage(language: AppLanguage) {
  window.localStorage.setItem(languageStorageKey, language);
  window.dispatchEvent(new Event(languageChangedEvent));
}

export function useAppLanguage() {
  const [language, setLanguage] = React.useState<AppLanguage>("en");

  React.useEffect(() => {
    const sync = () => setLanguage(getSavedLanguage());
    sync();
    window.addEventListener(languageChangedEvent, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(languageChangedEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return language;
}

export function LanguageSettings() {
  const language = useAppLanguage();

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="size-5 text-primary" />
          Language support
        </CardTitle>
        <CardDescription>
          Choose English or Somali for coaching notes, guidance text, and important helper messages.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Label>Coaching language</Label>
        <Select value={language} onChange={(event) => saveLanguage(event.target.value as AppLanguage)}>
          <option value="en">English</option>
          <option value="so">Somali</option>
        </Select>
        <p className="text-xs leading-5 text-muted-foreground">
          Doorashadani ma beddelayso website-ka oo dhan; waxay beddeshaa hadalada caawinta iyo coaching-ka si loo fahmo.
        </p>
      </CardContent>
    </Card>
  );
}
