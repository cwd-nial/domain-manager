"use client";

import { formatName } from "@/lib/formatName";
import { useNameFormat } from "@/lib/nameFormatContext";

export function FormattedName({ firstName, lastName }: { firstName: string; lastName: string }) {
  const [format] = useNameFormat();
  return <>{formatName(firstName, lastName, format)}</>;
}
