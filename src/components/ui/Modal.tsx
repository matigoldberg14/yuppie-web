import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { TbAlertOctagonFilled } from 'react-icons/tb';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function ErrorModal({ isOpen, onClose, title, message }: Props) {
  return (
    <Dialog
      open={isOpen}
      transition
      className='relative z-10 focus:outline-none'
      onClose={onClose}
    >
      <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
        <div className='flex min-h-full items-center justify-center p-4 bg-black/50'>
          <DialogPanel className='w-full max-w-md flex flex-col justify-center items-end gap-4 rounded-xl bg-primary-light p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0'>
            <DialogTitle className='text-2xl font-bold w-full flex items-center gap-2 text-white'>
              <TbAlertOctagonFilled className='text-white w-10 h-10 aspect-square' />
              {title}
            </DialogTitle>

            <p className='text-lg w-full text-white/90'>{message}</p>

            <button
              type='button'
              className='flex justify-center items-center px-4 py-2 rounded-md bg-white text-black'
              onClick={onClose}
            >
              Entendido
            </button>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
