import React, { ReactNode, useCallback } from "react";
import classNames from "classnames";
import { Button, EnumButtonStyle } from "../Components/Button";
import { Tooltip } from "@primer/components";
import { MenuFixedPanel } from "../util/teleporter";

import { Icon } from "@rmwc/icon";
import "./MenuItem.scss";

type Props = {
  /** Text to be displayed as a tooltip */
  tooltip: string;
  /** the name of the icon to display */
  icon: string;
  /** indication whether the fixed panel is open or not */
  isOpen: boolean;
  /* the content to display in the fixed panel*/
  children?: ReactNode;
  /* the key of the panel to be returned to the menu component when this item is clicked*/
  panelKey: string;
  onClick: (panelKey: string) => void;
};

const DIRECTION = "e";
const ICON_SIZE = "xlarge";

const MenuItemWithFixedPanel = ({
  tooltip,
  icon,
  isOpen,
  children,
  panelKey,
  onClick,
}: Props) => {
  const handleClick = useCallback(() => {
    onClick(panelKey);
  }, [panelKey, onClick]);

  return (
    <div
      className={classNames("amp-menu-item amp-menu-item--with-fixed-panel", {
        "amp-menu-item--with-fixed-panel--active": isOpen,
      })}
    >
      <div className="amp-menu-item__wrapper">
        <Tooltip
          className="amp-menu-item__tooltip"
          aria-label={tooltip}
          direction={DIRECTION}
          noDelay
        >
          <Button buttonStyle={EnumButtonStyle.Clear} onClick={handleClick}>
            <Icon
              icon={{
                icon: icon,
                size: ICON_SIZE,
              }}
            />
          </Button>
        </Tooltip>
      </div>
      {isOpen && <MenuFixedPanel.Source>{children}</MenuFixedPanel.Source>}
    </div>
  );
};

export default MenuItemWithFixedPanel;
