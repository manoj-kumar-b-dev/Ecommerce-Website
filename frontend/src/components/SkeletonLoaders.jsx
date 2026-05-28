import React from 'react';

export const ProductCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-pulse flex flex-col h-full">
    <div className="aspect-square bg-gray-200 w-full" />
    <div className="p-4 flex-grow space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 animate-pulse">
    <div className="space-y-4">
      <div className="aspect-square bg-gray-200 rounded-xl w-full" />
      <div className="flex gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 w-20 bg-gray-200 rounded-lg flex-shrink-0" />
        ))}
      </div>
    </div>
    <div className="space-y-6 flex flex-col">
      <div className="h-4 bg-gray-200 rounded w-1/6" />
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-16 bg-gray-200 rounded w-full" />
      <div className="h-24 bg-gray-200 rounded w-full" />
      <div className="mt-auto space-y-3 pt-6">
        <div className="h-12 bg-gray-200 rounded-md w-full" />
      </div>
    </div>
  </div>
);

export const CartSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start animate-pulse">
    <div className="lg:col-span-2 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl items-center">
          <div className="h-20 w-20 bg-gray-200 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-20" />
        </div>
      ))}
    </div>
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-full" />
      </div>
      <div className="h-10 bg-gray-200 rounded w-full" />
    </div>
  </div>
);

export const AdminTableSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/4" />
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded" />
      ))}
    </div>
  </div>
);

export default {
  ProductCardSkeleton,
  ProductDetailSkeleton,
  CartSkeleton,
  AdminTableSkeleton,
};