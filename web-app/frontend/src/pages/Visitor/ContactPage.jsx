import { useState } from "react";
import { toast } from "react-toastify";
import { Field, Label, Switch } from "@headlessui/react";
import { useGetCinemasQuery } from "../../redux/api/cinemaApiSlice";
import { useSendContactFormMutation } from "../../redux/api/userApiSlice";
import LoaderFull from "../../components/LoaderFull";

const ContactPage = () => {
  const [agreedPolicy, setAgreedPolicy] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const {
    data: cinemas,
    isError: cinemasError,
    isLoading: cinemasLoading,
  } = useGetCinemasQuery();

  const [sendContactForm, { isLoading }] = useSendContactFormMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreedPolicy) {
      toast.error("Veuillez accepter la politique de confidentialité.");
      return;
    }

    try {
      await sendContactForm({
        contactFormSenderUserName: userName || "Anonyme",
        contactFormSenderEmail: email,
        contactFormSubject: subject,
        contactFormMessage: message,
      }).unwrap();

      toast.success("Votre message a été envoyé avec succès.");

      // Reset form fields
      setUserName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setAgreedPolicy(false);
    } catch (error) {
      toast.error(
        "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer."
      );
      console.error("Error sending contact form:", error);
    }
  };

  if (cinemasLoading) return <LoaderFull />;
  if (cinemasError) return <div>Error loading data</div>;

  return (
    <div className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Contactez-nous
        </h2>
        <p className="mt-2 text-lg leading-8 text-gray-600">
          Nous sommes à votre écoute pour toute question ou demande de
          renseignement.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mx-auto mt-16 max-w-xl sm:mt-16">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="userName"
              className="block text-sm font-semibold leading-6 text-gray-900"
            >
              Nom d'utilisateur
            </label>
            <div className="mt-2.5">
              <input
                id="userName"
                name="userName"
                type="text"
                autoComplete="given-name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold leading-6 text-gray-900"
            >
              Email
            </label>
            <div className="mt-2.5">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="subject"
              className="block text-sm font-semibold leading-6 text-gray-900"
            >
              Sujet
            </label>
            <div className="mt-2.5">
              <input
                id="subject"
                name="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="message"
              className="block text-sm font-semibold leading-6 text-gray-900"
            >
              Message
            </label>
            <div className="mt-2.5">
              <textarea
                id="message"
                name="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                defaultValue={""}
              />
            </div>
          </div>
          <Field className="flex gap-x-4 sm:col-span-2">
            <div className="flex h-6 items-center">
              <Switch
                checked={agreedPolicy}
                onChange={setAgreedPolicy}
                className="group flex w-8 flex-none cursor-pointer rounded-full bg-gray-200 p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600 data-[checked]:bg-yellow-600"
              >
                <span className="sr-only">Agree to policies</span>
                <span
                  aria-hidden="true"
                  className="h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out group-data-[checked]:translate-x-3.5"
                />
              </Switch>
            </div>
            <Label className="text-sm leading-6 text-gray-600">
              J'accepte la{" "}
              <a
                href="/privacy-policy"
                className="font-semibold text-yellow-600"
              >
                politique de confidentialité.
              </a>
            </Label>
          </Field>
        </div>
        <div className="mt-10">
          <button
            type="submit"
            disabled={!agreedPolicy || isLoading}
            className={`block w-full rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600 ${
              !agreedPolicy || isLoading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {isLoading ? "Envoi en cours..." : "Envoyer"}
          </button>
        </div>
      </form>
      <div className="border-t border-gray-300 mt-16 max-w-7xl mx-auto grid grid-cols-1 gap-x-8 gap-y-10 pt-16 lg:grid-cols-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Locations
          </h2>
          <p className="mt-4 leading-7 text-gray-600">
            Retrouvez-nous dans les villes suivantes :
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2 lg:gap-8">
          {cinemas.map((cinema) => (
            <div key={cinema.id} className="rounded-2xl bg-gray-50 p-10">
              <h3 className="text-base font-semibold leading-7 text-gray-900">
                {cinema.cinemaName}
              </h3>
              <address className="mt-3 space-y-1 not-italic leading-6 text-gray-600">
                <p className="text-sm">{cinema.cinemaAddress}</p>
                <p className="text-sm">
                  {cinema.cinemaPostalCode} {cinema.cinemaCity},{" "}
                  {cinema.cinemaCountry}
                </p>
                <p className="text-sm">{cinema.cinemaTelNumber}</p>
              </address>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
