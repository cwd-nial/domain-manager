"use client";

import { useNameFormat } from "@/lib/nameFormatContext";
import { formatName } from "@/lib/formatName";

export function FormattedName({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const [format] = useNameFormat();
  return <>{formatName(firstName, lastName, format)}</>;
}
