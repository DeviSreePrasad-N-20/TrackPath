import { Link } from 'react-router-dom';
import { User, Briefcase, BarChart3, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="bg-blue-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center border border-blue-100">
        <div className="flex-1 space-y-6">
          <p className="text-blue-600 font-semibold uppercase tracking-wider text-sm">Welcome to TrackPath</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Tell us how your <span className="text-blue-700 italic">career journey</span> is going.
          </h1>
          <p className="text-lg text-gray-600">
            TrackPath helps training programmes understand whether learners found work, grew their income, or need more support after training.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/trainee" className="bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-6 rounded-lg text-center transition">
              I completed training &rarr;
            </Link>
            <Link to="/employer" className="bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 font-medium py-3 px-6 rounded-lg text-center transition">
              I am an employer
            </Link>
          </div>
        </div>
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full">
          <div className="flex items-center gap-2 text-sm text-green-700 mb-6 font-medium">
            <Shield size={18} /> You are in control of your info
          </div>
          <h3 className="text-xl font-bold mb-4">What happens next?</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">1</div>
              <div>
                <p className="font-bold text-gray-900">Training</p>
                <p className="text-sm text-gray-500">You completed a skilling scheme</p>
              </div>
            </div>
            <div className="w-0.5 h-6 bg-gray-200 ml-4"></div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">2</div>
              <div>
                <p className="font-bold text-gray-900">Job</p>
                <p className="text-sm text-gray-500">You found employment</p>
              </div>
            </div>
            <div className="w-0.5 h-6 bg-gray-200 ml-4"></div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">3</div>
              <div>
                <p className="font-bold text-gray-900">Progress</p>
                <p className="text-sm text-gray-500">Share your 2-minute update</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <p className="text-gray-500 font-semibold uppercase tracking-wider text-sm mb-6 text-center">Choose what you want to do</p>
        <div className="grid md:grid-cols-3 gap-6">
          <Link to="/trainee" className="group block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
              <User size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">I completed training</h3>
            <p className="text-gray-600 text-sm">Share a 2-minute work update to help your program improve.</p>
          </Link>
          <Link to="/employer" className="group block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-green-300 transition">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition">
              <Briefcase size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">I am an employer</h3>
            <p className="text-gray-600 text-sm">Confirm someone’s employment in under a minute without logging in.</p>
          </Link>
          <Link to="/admin" className="group block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-purple-300 transition">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition">
              <BarChart3 size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">I manage a scheme</h3>
            <p className="text-gray-600 text-sm">View anonymised results, analytics, and track outcomes.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
