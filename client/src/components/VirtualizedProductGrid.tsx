import { memo, useMemo, useState, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { OptimizedProductCard } from '@/components/OptimizedProductCard';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  imageUrl: string;
  discountPrice?: string;
  category: 'men' | 'women' | 'unisex';
}

interface VirtualizedProductGridProps {
  products: Product[];
  columns?: number;
  itemHeight?: number;
  containerHeight?: number;
}

interface GridItemProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    products: Product[];
    columns: number;
  };
}

const GridItem = memo(({ columnIndex, rowIndex, style, data }: GridItemProps) => {
  const { products, columns } = data;
  const index = rowIndex * columns + columnIndex;
  const product = products[index];

  if (!product) {
    return <div style={style} />;
  }

  return (
    <div style={{ ...style, padding: '8px' }}>
      <OptimizedProductCard product={product} />
    </div>
  );
});

GridItem.displayName = 'GridItem';

const VirtualizedProductGrid = memo(({
  products,
  columns = 4,
  itemHeight = 320,
  containerHeight = 600,
}: VirtualizedProductGridProps) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: false,
  });

  const gridData = useMemo(() => ({
    products,
    columns,
  }), [products, columns]);

  const rowCount = Math.ceil(products.length / columns);

  // Only render the grid when it's in view for performance
  if (!isIntersecting) {
    return (
      <div 
        ref={ref as any} 
        style={{ height: containerHeight }}
        className="flex items-center justify-center bg-gray-50 rounded-lg"
      >
        <div className="text-gray-500">Loading products...</div>
      </div>
    );
  }

  return (
    <div ref={ref as any} className="w-full">
      <Grid
        columnCount={columns}
        columnWidth={300}
        width={columns * 300}
        height={containerHeight}
        rowCount={rowCount}
        rowHeight={itemHeight}
        itemData={gridData}
        overscanRowCount={2}
        overscanColumnCount={1}
      >
        {GridItem}
      </Grid>
    </div>
  );
});

VirtualizedProductGrid.displayName = 'VirtualizedProductGrid';

export { VirtualizedProductGrid };