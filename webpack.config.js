var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var node_modules_dir = __dirname + '/node_modules';

const PORT = 3000;
const SERVER_URL = 'http://localhost:' + PORT;

module.exports = {
    debug: true,
    devtool: '#eval-source-map',

    module: {
        // preLoaders: [
        //     { test: /\.js$/, loader: 'eslint', exclude: /node_modules/ },
        // ],
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ['react-hot', 'babel']
            },
            // Extract css files
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            },
            // Optionally extract less files
            // or any other compile-to-css language
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!autoprefixer-loader!less-loader?sourceMap")
            },
            // bootflat
            { test: /\.(png)$/, loader: 'url-loader?limit=100000' },
            // font awesome
            {
                test: /\.(woff|woff2|ttf|eot|svg)(\?]?.*)?$/,
                loader: 'file-loader?name=fonts/[name].[ext]?[hash]'
            }
        ]
    },
    entry: [
        './src/client/app.js',
        'webpack-dev-server/client?' + SERVER_URL,
        'webpack/hot/only-dev-server'
        //'./public/less/timetracking.less'
    ],
    output: {
        path: path.join(__dirname, 'public'),
        publicPath: '/',
        // If you want to generate a filename with a hash of the content (for cache-busting)
        // filename: "main-[hash].js",
        filename: 'app.js'
    },
    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin("app.css", { allChunks: true }),
        // fix bootflat's broken url request
        new webpack.NormalModuleReplacementPlugin(
            /bootflat\/img\/check_flat\/default\.png$/,
            node_modules_dir + '/bootflat/bootflat/img/check_flat/default.png'
        )
    ],

    devServer: {
        port: PORT,
        contentBase: "./public",
        hot: true,
        quiet: false,
        noInfo: true,
        inline: true,
        colors: true,
        historyApiFallback: true
    },

    eslint: { emitWarning: true },

    resolve: {
        extensions: ['', '.js', '.jsx']
    }
};
