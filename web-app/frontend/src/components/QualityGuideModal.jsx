import React from "react";
import Modal from "react-modal";
import { qualityIcons } from "../redux/constants";

const QualityGuideModal = ({
  isOpen,
  onClose,
  qualities,
  getQualityDescription,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Quality Guide"
      className="fixed inset-0 flex items-center justify-center z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75"
    >
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Guide des qualités</h2>
        {qualities.map((quality) => (
          <div key={quality} className="mb-4 flex items-start">
            <img
              src={qualityIcons[quality]}
              alt={quality}
              className="h-10 w-10 mr-3"
            />
            <div>
              <h3 className="font-semibold">{quality}</h3>
              <p className="text-sm text-gray-600">
                {getQualityDescription(quality)}
              </p>
            </div>
          </div>
        ))}
        <button
          onClick={onClose}
          className="mt-4 block rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm bg-gray-300 text-gray-600 hover:bg-gray-400"
        >
          Fermer
        </button>
      </div>
    </Modal>
  );
};

export default QualityGuideModal;
