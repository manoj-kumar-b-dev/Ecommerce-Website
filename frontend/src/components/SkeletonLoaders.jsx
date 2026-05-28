import React from 'react';

const ShimmerBlock = ({ className = '' }) => (
  <div className={`skeleton-shimmer rounded-xl ${className}`} />
);

export const ProductCardSkeleton = () => (
  <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
    <ShimmerBlock className="aspect-square w-full rounded-none" />
    <div className="p-4 flex-grow space-y-3">
      <ShimmerBlock className="h-3 w-1/4" />
      <ShimmerBlock className="h-4 w-3/4" />
      <ShimmerBlock className="h-4 w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <ShimmerBlock className="h-5 w-1/3" />
        <ShimmerBlock className="h-4 w-1/4" />
      </div>
    </div>
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
      <div className="space-y-4">
        <ShimmerBlock className="aspect-square w-full rounded-2xl" />
        <div className="flex gap-3">
          {[...Array(4)].map((_, i) => (
            <ShimmerBlock key={i} className="h-20 w-20 rounded-xl flex-shrink-0" />
          ))}
        </div>
      </div>
      <div className="space-y-6 flex flex-col">
        <ShimmerBlock className="h-4 w-1/6" />
        <ShimmerBlock className="h-8 w-3/4" />
        <ShimmerBlock className="h-4 w-1/3" />
        <ShimmerBlock className="h-10 w-1/2" />
        <ShimmerBlock className="h-20 w-full" />
        <div className="mt-auto space-y-3 pt-6">
          <ShimmerBlock className="h-12 w-full rounded-xl" />
          <ShimmerBlock className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

export const CartSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
    <div className="lg:col-span-2 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white border border-gray-200/80 rounded-2xl items-center">
          <ShimmerBlock className="h-20 w-20 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <ShimmerBlock className="h-4 w-1/2" />
            <ShimmerBlock className="h-3 w-1/4" />
          </div>
          <ShimmerBlock className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 space-y-4">
      <ShimmerBlock className="h-5 w-1/2" />
      <div className="space-y-2">
        <ShimmerBlock className="h-3 w-full" />
        <ShimmerBlock className="h-3 w-full" />
      </div>
      <ShimmerBlock className="h-12 w-full rounded-xl" />
    </div>
  </div>
);

export const AdminTableSkeleton = () => (
  <div className="space-y-4">
    <ShimmerBlock className="h-8 w-1/4" />
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <ShimmerBlock key={i} className="h-12 rounded-lg" />
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