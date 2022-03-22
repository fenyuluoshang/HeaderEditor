import * as React from 'react';

interface IconProps {
  type: string;
}

function Icon(props: IconProps) {
  return <i className={`iconfont icon-${props.type}`} />;
}

export default Icon;
