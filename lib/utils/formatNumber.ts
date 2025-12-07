import { formatUnits } from "viem";

function getFormatterRule(input: number) {
  const rules = [
    {
      exact: 0,
      formatterOptions: {
        notation: "standard",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      },
    },
    {
      upperBound: 0.0001,
      formatterOptions: {
        notation: "standard",
        maximumFractionDigits: 8,
        minimumFractionDigits: 0,
      },
    },
    {
      upperBound: 1,
      formatterOptions: {
        notation: "standard",
        maximumFractionDigits: 5,
        minimumFractionDigits: 3,
      },
    },
    {
      upperBound: 1e6,
      formatterOptions: {
        notation: "standard",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      },
    },
    {
      upperBound: 1e15,
      formatterOptions: {
        notation: "compact",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
    {
      upperBound: Infinity,
      hardCodedInput: { input: 999_000_000_000_000, prefix: ">" },
      formatterOptions: {
        notation: "compact",
        maximumFractionDigits: 2,
      },
    },
  ];
  for (const rule of rules) {
    if (
      (rule.exact !== undefined && input === rule.exact) ||
      (rule.upperBound !== undefined && input < rule.upperBound)
    ) {
      return rule;
    }
  }

  return { hardCodedInput: undefined, formatterOptions: undefined };
}

export function formatNumber(
  input: number | string | undefined | null,
  noDecimals = false,
  placeholder = "-"
): string {
  const locale = "en-US";

  if (input === null || input === undefined) {
    return placeholder;
  }

  if (typeof input === "string") {
    input = parseFloat(input);
  }

  if (!Number.isFinite(input)) {
    return placeholder;
  }

  const isNegative = input < 0;
  const absInput = Math.abs(input);

  const { hardCodedInput, formatterOptions } = getFormatterRule(absInput);

  if (!formatterOptions) {
    return placeholder;
  }

  const formatValue = (value: number) =>
    new Intl.NumberFormat(
      locale,
      noDecimals
        ? { notation: "compact", maximumFractionDigits: 0 }
        : // eslint-disable-next-line
          (formatterOptions as any)
    ).format(value);

  let formatted = "";

  if (!hardCodedInput) {
    formatted = formatValue(absInput);
  } else {
    const { input: hardCodedInputValue, prefix } = hardCodedInput;
    if (hardCodedInputValue === undefined) {
      return placeholder;
    }
    formatted = `${prefix ?? ""}${formatValue(hardCodedInputValue)}`;
  }

  if (!isNegative) {
    return formatted;
  }

  if (formatted.startsWith("<")) {
    return `>-${formatted.slice(1)}`;
  }

  if (formatted.startsWith(">")) {
    return `<-${formatted.slice(1)}`;
  }

  return `-${formatted}`;
}

export function formatUsdc(amount: number | bigint | string) {
  return formatUnits(BigInt(amount), 6);
}
