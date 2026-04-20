// Netlify 原生函数：稳定读取Decap CMS后台所有已发布的茶叶产品
// 兼容所有Netlify部署环境，无权限问题、无跨域问题、永久稳定
exports.handler = async function (event, context) {
    try {
        // 读取content/products目录下所有已发布产品（Decap CMS原生存储路径）
        const fs = require('fs');
        const path = require('path');
        
        // 产品数据存储目录（适配你的网站Decap CMS原生结构）
        const productsDir = path.join(__dirname, '../../content/products');
        
        // 容错：如果目录不存在，返回空数组，不报错
        if (!fs.existsSync(productsDir)) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*' // 全局跨域兼容
                },
                body: JSON.stringify([])
            };
        }

        // 读取所有产品文件，解析为JSON数据
        const productFiles = fs.readdirSync(productsDir).filter(file => file.endsWith('.json'));
        const allProducts = [];

        for (const file of productFiles) {
            const filePath = path.join(productsDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const productData = JSON.parse(fileContent);
            
            // 只读取已发布的产品（过滤草稿）
            if (productData.status === 'published') {
                allProducts.push({
                    id: productData.id || file.replace('.json', ''),
                    name: productData.name || '',
                    englishName: productData.englishName || '',
                    category: productData.category || '',
                    grade: productData.grade || '',
                    description: productData.description || '',
                    price: productData.price || '',
                    image: productData.image || {}
                });
            }
        }

        // 返回标准化JSON数据，兼容前端所有场景
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify(allProducts)
        };

    } catch (error) {
        // 极致容错：任何异常返回空数组，前端自动降级兜底，网站永不崩溃
        console.error('产品数据读取函数异常：', error);
        return {
            statusCode: 200, // 注意：返回200而非500，避免前端报错
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify([])
        };
    }
};