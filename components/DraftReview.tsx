import { Input } from "./ui/input";
import React, { useState } from "react";
import type { Locale } from "../types";
import { useLocale } from "../contexts/LocaleContext";
import { reviewDraft } from "../services/draftReview";
const labels: Record<Locale, string[]> = {
  en: [
    "Draft review",
    "Words",
    "Characters",
    "Maximum words (optional)",
    "Above your target. Shorten the draft before sending.",
    "Replace these placeholders:",
    "No common placeholders found.",
    "Checks length and common placeholders only. Verify facts yourself.",
  ],
  ru: [
    "Проверка черновика",
    "Слов",
    "Символов",
    "Максимум слов (необязательно)",
    "Объём выше цели. Сократите текст перед отправкой.",
    "Замените шаблонные поля:",
    "Распространённые шаблонные поля не найдены.",
    "Проверяются только объём и шаблонные поля. Факты проверяйте самостоятельно.",
  ],
  es: [
    "Revisión del borrador",
    "Palabras",
    "Caracteres",
    "Máximo de palabras (opcional)",
    "Supera tu objetivo. Acorta el borrador.",
    "Sustituye estos campos:",
    "No se encontraron campos comunes.",
    "Solo se revisan la longitud y los campos comunes. Verifica los hechos.",
  ],
  fr: [
    "Vérification du brouillon",
    "Mots",
    "Caractères",
    "Nombre maximum de mots (facultatif)",
    "Votre objectif est dépassé. Raccourcissez le texte.",
    "Remplacez ces champs :",
    "Aucun champ courant trouvé.",
    "Seuls la longueur et les champs courants sont vérifiés. Vérifiez les faits.",
  ],
  nl: [
    "Conceptcontrole",
    "Woorden",
    "Tekens",
    "Maximum woorden (optioneel)",
    "Boven je doel. Kort de tekst in.",
    "Vervang deze velden:",
    "Geen gangbare invulvelden gevonden.",
    "Controleert alleen lengte en gangbare invulvelden. Controleer feiten zelf.",
  ],
  pt: [
    "Revisão do rascunho",
    "Palavras",
    "Caracteres",
    "Máximo de palavras (opcional)",
    "Acima da meta. Encurte o rascunho.",
    "Substitua estes campos:",
    "Nenhum campo comum encontrado.",
    "Verifica apenas tamanho e campos comuns. Confira os fatos.",
  ],
  ar: [
    "مراجعة المسودة",
    "كلمات",
    "أحرف",
    "الحد الأقصى للكلمات (اختياري)",
    "تجاوزت الهدف. اختصر المسودة قبل الإرسال.",
    "استبدل هذه الحقول:",
    "لم يتم العثور على حقول شائعة.",
    "يفحص الطول والحقول الشائعة فقط. تحقق من الحقائق بنفسك.",
  ],
};
export default function DraftReview({ text }: { text: string }) {
  const { locale } = useLocale();
  const [maximum, setMaximum] = useState("");
  const c = labels[locale];
  const result = reviewDraft(text, locale, Number(maximum));
  return (
    <details
      className="mt-6 rounded-lg border border-border bg-card-secondary/60 p-4"
      open
    >
      <summary className="text-sm font-semibold">
        {c[0]}{" "}
        <span className="ms-2 font-normal text-text-secondary">
          {result.words} {c[1].toLocaleLowerCase(locale)}
        </span>
      </summary>
      <div className="mt-4 space-y-3 text-xs leading-6">
        <div className="flex flex-wrap justify-between gap-3">
          <p>
            {c[1]}: <strong>{result.words}</strong> · {c[2]}:{" "}
            {result.characters}
          </p>
          <label
            className="flex flex-wrap items-center gap-2"
            htmlFor="draft-word-limit"
          >
            {c[3]}
            <Input
              id="draft-word-limit"
              type="number"
              min="1"
              max="100000"
              inputMode="numeric"
              value={maximum}
              onChange={(event) => setMaximum(event.target.value)}
              className="w-20 rounded-md border border-border bg-card px-2 py-1"
            />
          </label>
        </div>
        {result.overLimit && (
          <p role="status" className="font-medium text-text-primary">
            {c[4]}
          </p>
        )}
        {result.placeholders.length ? (
          <div>
            <p className="font-semibold">{c[5]}</p>
            <ul className="flex flex-wrap gap-2">
              {result.placeholders.map((placeholder) => (
                <li
                  key={placeholder}
                  className="rounded bg-card px-2 break-all"
                >
                  {placeholder}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>{c[6]}</p>
        )}
        <p className="text-text-secondary">{c[7]}</p>
      </div>
    </details>
  );
}
