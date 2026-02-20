import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-logo)" }}>
              SIMPLICITY
            </h2>
            <p className="text-gray-600 text-sm mt-2">Order in a chaotic world.</p>
          </div>
          
          <div className="text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Simplicity Life Blog. All thoughts shared are my own.</p>
            <p className="mt-1">Written slowly. Read gently.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer