export default [
   {
        // icon: "email",
        name: "商品管理",
        path: "/erp/product",
        children: [           
            {
                // icon: "email",
                name: "商品管理",
                path: "/online/product/list",
            },
            // {
            //     name: '商品编辑',
            //     hideInMenu: true,
            //     path: '/online/product/edit'
            // },
            {
                // icon: "email",
                name: "商品报价",
                path: "/online/product/quoted",
            },
            {
                // icon: "email",
                name: "商品库存",
                path: "/online/product/stock/list",
            },
            {
                // icon: "email",
                name: "订购规则",
                path: "/online/product/order/limit/rule",
            },
            {
                // icon: "email",
                name: "套餐管理",
                path: "/online/product/package",
            },
            {
                name: "礼品管理",
                path: "/online/product/gift",
            },
            {
                name: "优惠管理",
                path: "/online/product/coupon",
            },
            {
                name: "运费规则设置",
                path: "/online/logistics/rule",
            },
            // {
            //     name: "活动价管理",
            //     path: '/online/product/ladder'
            // }
        ]
    },
    {
        name: "订单管理",
        path: "/erp/order",
        children: [
            {
                name: "客户审核",
                path: "/online/user/list",
            },
            {
                name: "订单审核",
                path: "/online/order/list",
            },
            {
                name: "付款帐号",
                path: "/online/account/list",
            },
            {
                name: "收款核对",
                path: "/online/payment/list",
            },
            {
                name: "收货地址审核",
                path: "/online/receipt/list",
            }
        ]
    },
    {
        name: '账本管理',
        path: '/erp/book',
        children: [
            {
                name: '客户账本',
                path: '/online/book/list'
            }
        ]
    },
    {
        name: '设置',
        path: '/erp/setting',
        children: [
            {
                name: '轮播图设置',
                path: '/online/setting/carousel'
            }
        ]
    }
    // {
    //     name: '消息管理',
    //     children: [
    //         {
    //             name: "通知管理",
    //             path: '/online/notice/manager'
    //         }
    //     ]
    // },
    // {
    //     name: '额度管理',
    //     children: [
    //         {
    //             name: "额度管理",
    //             path: '/online/amount/manager'
    //         }
    //     ]
    // }
    
]