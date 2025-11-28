import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import type { Connector } from "wagmi";
import { useConnect } from "wagmi";
import { base } from "wagmi/chains";
import { useConnectWalletModalStore } from "@/stores/connectWalletModal";

interface Props {
  className?: string;
  buttonClassName?: string;
  connectors: Connector[];
  prefix?: string;
}

export const ConnectEOAForm: React.FC<Props> = ({
  connectors,
  className,
  buttonClassName,
  prefix,
}) => {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {connectors.map((connector) => (
        <ConnectEOAButton
          key={connector.id}
          connector={connector}
          className={buttonClassName}
          prefix={prefix}
        />
      ))}
    </div>
  );
};

interface ConnectEOAButtonProps {
  connector: Connector;
  className?: string;
  prefix?: string;
}

const ConnectEOAButton: React.FC<ConnectEOAButtonProps> = ({
  connector,
  className,
  prefix,
}) => {
  const { connectAsync, isPending } = useConnect();

  const { setOpen } = useConnectWalletModalStore();

  const onConnect = useCallback(
    async (connector: Connector) => {
      await connectAsync(
        { connector, chainId: base.id },
        {
          onSuccess: () => {
            void toast.success("Connect wallet success");
            setOpen(false);
          },
          onError: (error) => {
            void toast.error(error.message);
          },
        }
      );
    },
    [connectAsync, setOpen]
  );

  return (
    <Button
      variant="outline"
      className={cn("user-message w-full", className)}
      onClick={() => onConnect(connector)}
      size="lg"
      disabled={isPending}
    >
      {connector.icon && !isPending && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={connector.icon} alt={connector.name} className="size-4" />
      )}
      {isPending && <Loader2 className="size-4 animate-spin" />}
      {prefix ? `${prefix} ${connector.name}` : connector.name}
    </Button>
  );
};
