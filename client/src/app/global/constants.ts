export class Constants {
    static NEW_LINE_MAX_DISTANCE: number = 20;
    static PENCIL_INDEX_TOOLS: number = 0;
    static RECTANGLE_INDEX_TOOLS: number = 1;
    static ELLIPSE_INDEX_TOOLS: number = 2;
    static ERASER_INDEX_TOOLS: number = 3;
    static LINE_INDEX_TOOLS: number = 4;
    static POLYGON_INDEX_TOOLS: number = 5;
    static SPRAY_INDEX_TOOLS: number = 6;
    static SELECTOR_INDEX_TOOLS: number = 7;
    static STAMP_INDEX_TOOLS: number = 8;
    static BUCKET_INDEX_TOOLS: number = 9;

    static ERASER_FONT_SIZE: number = 5;
    static PENCIL_FONT_SIZE: number = 1;
    static RECTANGLE_FONT_SIZE: number = 1;
    static LINE_FONT_SIZE: number = 1;
    static ELLIPSE_FONT_SIZE: number = 1;
    static POLYGON_FONT_SIZE: number = 1;
    static SPRAY_SIZE: number = 10;

    static LINE_DASH_STRAIGHT: number = 5;
    static LINE_DASH_EMPTY: number = 5;
    static MAX_SIZE_WIDTH: number = 50;

    static ITEM_NOT_FOUND: number = -1;

    static SIDEBAR_WIDTH_CONST: number = 343;

    static COLOR_0: number = 0;
    static COLOR_1: number = 1;
    static COLOR_2: number = 2;
    static COLOR_3: number = 3;
    static COLOR_4: number = 4;
    static COLOR_5: number = 5;
    static COLOR_6: number = 6;
    static COLOR_7: number = 7;
    static COLOR_8: number = 8;
    static COLOR_9: number = 9;
    static RECENT_COLOR_NUMBER: number = 10;
    static COLOR_BOX_THICKNESS: number = 8;
    static COLOR_THICKNESS_HEIGHT: number = 5;
    static COLOR_LINEWIDTH: number = 3;
    static COLOR_STEP_3: number = 3;
    static COLOR_STEP_4: number = 4;
    static COLOR_STEP_5: number = 5;
    static OPACITY_DECIMAL: number = 100;

    static COLOR_STEP: number = 0.17;

    static BORDER: string = '5px double rgb(0, 0, 0)';
    static BORDER_NONE: string = '5px none rgb(0, 0, 0)';
    static BORDER_CANVAS_BUFFER: number = 2;

    static LOGO_WIDTH: number = 50;
    static LOGO_WIDTH_PREVIEW: number = 35;
    static TIMER_DELAY_10: number = 10;
    static TIMER_DELAY_20: number = 20;
    static TIMER_DELAY_50: number = 50;
    static TIMER_DELAY_200: number = 200;
    static TIMER_DELAY_2000: number = 2000;
    static TIMER_DELAY_1000: number = 1000;
    static TIMER_DELAY_100: number = 100;
    static TIMER_DELAY_500: number = 500;
    static RGB_WHITE_VALUE: number = 255;
    static RGB_MAX_VALUE: number = 255;
    static BLUE_LIGHT_REDUCTION_RATIO: number = 0.1;
    static BLUE_LIGHT_REDUCTION_RATIO_WHITE: number = 0.88;
    static LINE_DASH_SELECTOR: number = 4;
    static PIXEL_INCREMENT: number = 4;
    static RGB_WHITE_TRESHOLD: number = 220;
    static RGB_BLACK_TRESHOLD: number = 200;
    static GREY_SCALE_R: number = 0.3;
    static GREY_SCALE_G: number = 0.59;
    static GREY_SCALE_B: number = 0.11;
    static GRID_WIDTH: number = 60;
    static GRID_WIDTH_PIX: number = 15;
    static INDEX_ALPHA: number = 3;
    static PIXEL_LENGTH: number = 4;
    static OUT_OF_CANVAS_COLOR_VALUE: number[] = [
        Constants.ITEM_NOT_FOUND,
        Constants.ITEM_NOT_FOUND,
        Constants.ITEM_NOT_FOUND,
        Constants.ITEM_NOT_FOUND,
    ];
    static MAX_TOLERANCE_VALUE: number = 100;
    static MAX_COLOR_DECIMAL_VALUE: number = 255;
    static INF_RINDEX: number = 0;
    static SUP_RINDEX: number = 1;
    static INF_GINDEX: number = 2;
    static SUP_GINDEX: number = 3;
    static INF_BINDEX: number = 4;
    static SUP_BINDEX: number = 5;
    static INF_AINDEX: number = 6;
    static SUP_AINDEX: number = 7;

    static PIXEL_INCREMENT_ARROWS: number = 3;
    static INITIAL_SIDE_POLYGON: number = 3;

    static INITIAL_SPRAY_SIZE: number = 10;
    static INITAIL_SPRAY_EMISSON: number = 6;

    static CIRCLE_LINE_POLYGON: number = 0.1;
    static CIRCLE_EMPTY_LINE_POLYGON: number = 0.05;

    static SPRAY_EMISSION_SPEED: number = 50;
    static INCREASE_FACTOR_EMISSION_SPEED: number = 10;

    static HTML_PAGE_DEPTH: number = 9;

    static INITIAL_SQUARE_DIMENSION: number = 20;
    static SQUARE_DMENSION_CHANGE: number = 5;
    static MIN_GRID_OPACITY: number = 0.1;
    static MIN_SQUARE_DIMENSION: number = 20;
    static MAX_SQUARE_DIMENSION: number = 100;

    static STAMP_SCALE: number = 20;
    static MIN_STAMP_SIZE: number = 20;
    static STAMP_ROTATION: number = 15;
    static HALF_CIRCLE_DEGREE: number = 180;
    static STMAP_ANGLE_NEG: number = -1;

    static SELECTION_CLICK_PADDING: number = 20;
    static SELECTION_MINIMUM_PATH_LENGTH: number = 3;

    static RESIZING_START_X_INDEX: number = 0;
    static RESIZING_END_X_INDEX: number = 1;
    static RESIZING_START_Y_INDEX: number = 2;
    static RESIZING_END_Y_INDEX: number = 3;
    static MIRROR_FACTOR: number = -1;
    static CANVAS_BORDER: number = 2;
}
