import ConfirmModal from "./ConfirmModal";
import { useAuth } from "../../contexts/AuthContext";

export default function LogoutConfirm({ onClose }: { onClose: () => void }) {
  const { signOut } = useAuth();

  return (
    <ConfirmModal
      title="¿Estás seguro que quieres cerrar sesión?"
      confirmLabel="Sí, cerrar sesión"
      onClose={onClose}
      onConfirm={() => {
        onClose();
        void signOut();
      }}
    >
      <p>
        Tu cuenta quedará desconectada y tendrás que iniciar sesión nuevamente para volver a
        acceder a PetClue.
      </p>
    </ConfirmModal>
  );
}
