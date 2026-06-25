"use client"

import { useState } from "react"

export function SignupForm() {
  const [formData, setFormData] = useState({
    nomRestaurant: "",
    typeCuisine: "",
    ville: "",
    telephone: "",
    email: "",
    motDePasse: "",
    confirmerMotDePasse: "",
    conditions: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(formData)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Créez votre compte restaurant
        </h1>
        <p className="text-gray-500">
          Rejoignez FidèleResto et commencez à fidéliser vos clients dès aujourd'hui.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du restaurant
            </label>
            <input
              type="text"
              placeholder="Chez Marco"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.nomRestaurant}
              onChange={(e) => setFormData({ ...formData, nomRestaurant: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de cuisine
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={formData.typeCuisine}
              onChange={(e) => setFormData({ ...formData, typeCuisine: e.target.value })}
            >
              <option value="">Sélectionnez un type</option>
              <option value="pizzeria">Pizzeria</option>
              <option value="kebab">Kebab</option>
              <option value="burger">Burger</option>
              <option value="sushi">Sushi</option>
              <option value="francais">Traditionnel français</option>
              <option value="italien">Italien</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <input
                type="text"
                placeholder="Paris"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                placeholder="06 12 34 56 78"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email professionnel
            </label>
            <input
              type="email"
              placeholder="contact@monresto.fr"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.motDePasse}
                onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.confirmerMotDePasse}
                onChange={(e) => setFormData({ ...formData, confirmerMotDePasse: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="conditions"
              className="mt-1 accent-blue-600"
              checked={formData.conditions}
              onChange={(e) => setFormData({ ...formData, conditions: e.target.checked })}
            />
            <label htmlFor="conditions" className="text-sm text-gray-600">
              J'accepte les{" "}
              <a href="/conditions" className="text-blue-600 hover:underline">
                conditions générales
              </a>{" "}
              et la{" "}
              <a href="/confidentialite" className="text-blue-600 hover:underline">
                politique de confidentialité
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Créer mon compte
          </button>

          <p className="text-center text-sm text-gray-500">
            Déjà un compte ?{" "}
            <a href="/connexion" className="text-blue-600 hover:underline font-medium">
              Se connecter
            </a>
          </p>

        </form>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        14 jours d'essai gratuit · Sans carte bancaire · Sans engagement
      </p>
    </div>
  )
}